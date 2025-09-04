import { useState, useRef, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';

interface ImagePreviewProps {
  imageSrc: string;
  naturalSize: { w: number; h: number } | null;
}

export default function ImagePreview({ imageSrc, naturalSize }: ImagePreviewProps) {
  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<null | {
    distance: number;
    startZoom: number;
    startPan: { x: number; y: number };
    startMid: { x: number; y: number };
  }>(null);

  // Compute dynamic container size
  const vw = typeof window !== 'undefined' ? Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) : 1200;
  const vh = typeof window !== 'undefined' ? Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) : 800;
  const maxW = hovered ? Math.floor(vw * 0.4) : Math.floor(vw * 0.3); // 40vw when hovered, 30vw when not
  const maxH = hovered ? Math.floor(vh - 82) : Math.floor(vh * 0.3); // full height when hovered, 30vh when not
  const imgW = naturalSize?.w ?? 800;
  const imgH = naturalSize?.h ?? 600;
  const scaleW = maxW / imgW;
  const scaleH = maxH / imgH;
  const fitScale = Math.min(scaleW, scaleH, 1); // do not upscale beyond natural size
  const containerWidth = Math.round(imgW * fitScale);
  const containerHeight = Math.round(imgH * fitScale);

  // Clamp pan so image always fills container
  const clampPan = (x: number, y: number, zoomLevel = zoom) => {
    const viewW = containerWidth;
    const viewH = containerHeight;
    const imgWz = viewW * zoomLevel;
    const imgHz = viewH * zoomLevel;
    const maxX = Math.max(0, (imgWz - viewW) / 2);
    const maxY = Math.max(0, (imgHz - viewH) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // Pointer/touch handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setHovered(true);
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      pinchRef.current = {
        distance: dist,
        startZoom: zoom,
        startPan: { ...pan },
        startMid: mid,
      };
    }
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    const prev = pointersRef.current.get(e.pointerId)!;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      // drag
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setPan((prevPan) => clampPan(prevPan.x + dx, prevPan.y + dy));
    } else if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const scaleRatio = dist / pinchRef.current.distance;
      const newZoom = Math.max(1, Math.min(3, pinchRef.current.startZoom * scaleRatio));
      // keep midpoint under fingers
      const deltaMidX = mid.x - pinchRef.current.startMid.x;
      const deltaMidY = mid.y - pinchRef.current.startMid.y;
      const attemptedPanX = pinchRef.current.startPan.x + deltaMidX;
      const attemptedPanY = pinchRef.current.startPan.y + deltaMidY;
      setZoom(Math.round(newZoom * 200) / 100);
      setPan(clampPan(attemptedPanX, attemptedPanY, newZoom));
    }
    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {}
    if (pointersRef.current.size < 2) pinchRef.current = null;
    e.preventDefault();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    pinchRef.current = null;
    e.preventDefault();
  };

  // Wheel zoom
  const handleImageWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHovered(true);
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prevZoom) => {
      const minZoom = 1;
      const newZoom = Math.round((prevZoom + delta) * 100) / 100;
      return Math.max(minZoom, Math.min(3, newZoom));
    });
  };

  // Clamp pan if zoom/container changes
  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y, zoom));
    // eslint-disable-next-line
  }, [zoom, containerWidth, containerHeight]);

  // Mouse hover events for desktop
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  // Dynamic container style
  const containerStyle = {
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    zIndex: 99999,
    position: 'absolute' as const,
    left: '50px',
    bottom: '50px',
    transition: 'width 0.2s, height 0.2s',
  };

  // Image transform
  const tx = pan.x / zoom;
  const ty = pan.y / zoom;
  const imageTransform = `scale(${zoom}) translate(${tx}px, ${ty}px)`;

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden bg-gray-200 border-4 border-black"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: 'transparent' }}
      >
        <CldImage
          src={imageSrc}
          width={imgW}
          height={imgH}
          alt="Campus location"
          className="block w-auto h-auto max-w-none max-h-none object-contain transition-opacity duration-500 opacity-100"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: imageTransform,
            transformOrigin: 'center center',
            transition: 'transform 0.1s',
            cursor: 'grab',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onWheel={handleImageWheel}
        />
      </div>
    </div>
  );
}
