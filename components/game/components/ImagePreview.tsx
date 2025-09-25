import { useState, useRef, useEffect } from "react";
import { CldImage } from "next-cloudinary";

interface ImagePreviewProps {
  imageSrc: string;
  naturalSize: { w: number; h: number } | null;
  enlarged: boolean; // Accept enlarged state as a prop
  setEnlarged: (value: boolean) => void; // Accept setEnlarged as a prop
}
export default function ImagePreview({
  imageSrc,
  naturalSize,
  enlarged,
  setEnlarged,
}: ImagePreviewProps) {
  // Pan key hold logic
  const panIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeKeysRef = useRef<Set<string>>(new Set()); // Track all active keys
  // Use a ref to track enlarged state for keydown handler
  const enlargedRef = useRef(false);

  // Zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  // Keep ref in sync with prop
  useEffect(() => {
    enlargedRef.current = enlarged;
  }, [enlarged]);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<null | {
    distance: number;
    startZoom: number;
    startPan: { x: number; y: number };
    startMid: { x: number; y: number };
  }>(null);

  // Compute dynamic container size
  const vw =
    typeof window !== "undefined"
      ? Math.max(
          document.documentElement.clientWidth || 0,
          window.innerWidth || 0
        )
      : 1200;
  const vh =
    typeof window !== "undefined"
      ? Math.max(
          document.documentElement.clientHeight || 0,
          window.innerHeight || 0
        )
      : 800;
  // Detect mobile devices
  const isMobile = typeof window !== "undefined" && vw < 768; // Mobile breakpoint

  // Use enlarged OR hovered for sizing
  const isLarge = enlarged || hovered;
  const maxW = isLarge ? Math.floor(vw * 0.5) : Math.floor(vw * 0.3); // 50vw when enlarged/hovered, 30vw when not
  const maxH = isLarge ? Math.floor(vh - 82) : Math.floor(vh * 0.4); // full height when enlarged/hovered, 40vh when not
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

  // Global key handling for zoom, pan, and reset
  useEffect(() => {
    const PAN_STEP = 40;
    const panKeys = [
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowleft",
      "arrowdown",
      "arrowright",
    ];
    const zoomKeys = ["1", "2", "3"];
    const cornerKeys = ["q", "e", "z", "c"];

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "control" && !e.repeat) {
        if (enlargedRef.current) {
          setEnlarged(false);
          setHovered(false);
        } else {
          setEnlarged(true);
        }
      }

      if (enlargedRef.current) {
        if (zoomKeys.includes(key)) {
          e.preventDefault();
          switch (key) {
            case "1":
              setZoom(1);
              break;
            case "2":
              setZoom(2);
              break;
            case "3":
              setZoom(3);
              break;
          }
        } else if (cornerKeys.includes(key)) {
          e.preventDefault();
          const viewW = containerWidth;
          const viewH = containerHeight;
          const imgWz = viewW * zoom;
          const imgHz = viewH * zoom;
          const maxX = Math.max(0, (imgWz - viewW) / 2);
          const maxY = Math.max(0, (imgHz - viewH) / 2);
          switch (key) {
            case "q":
              setPan({ x: maxX, y: maxY });
              break;
            case "e":
              setPan({ x: -maxX, y: maxY });
              break;
            case "z":
              setPan({ x: maxX, y: -maxY });
              break;
            case "c":
              setPan({ x: -maxX, y: -maxY });
              break;
          }
        } else if (key === "shift" || key === "escape") {
          e.preventDefault();
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else if (panKeys.includes(key)) {
          activeKeysRef.current.add(key);
          if (!panIntervalRef.current) {
            panIntervalRef.current = setInterval(() => {
              setPan((prev) => {
                let deltaX = 0;
                let deltaY = 0;
                activeKeysRef.current.forEach((activeKey) => {
                  switch (activeKey) {
                    case "w":
                    case "arrowup":
                      deltaY += PAN_STEP;
                      break;
                    case "a":
                    case "arrowleft":
                      deltaX += PAN_STEP;
                      break;
                    case "s":
                    case "arrowdown":
                      deltaY -= PAN_STEP;
                      break;
                    case "d":
                    case "arrowright":
                      deltaX -= PAN_STEP;
                      break;
                  }
                });
                return clampPan(prev.x + deltaX, prev.y + deltaY, zoom);
              });
            }, 30);
          }
        }
      }
    };

    const handleWindowKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (panKeys.includes(key)) {
        activeKeysRef.current.delete(key);
        if (activeKeysRef.current.size === 0 && panIntervalRef.current) {
          clearInterval(panIntervalRef.current);
          panIntervalRef.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    window.addEventListener("keyup", handleWindowKeyUp);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
      window.removeEventListener("keyup", handleWindowKeyUp);
      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
        panIntervalRef.current = null;
      }
    };
  }, [setEnlarged, zoom, containerWidth, containerHeight]);

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
      const mid = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
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
      const mid = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      const scaleRatio = dist / pinchRef.current.distance;
      const newZoom = Math.max(
        1,
        Math.min(3, pinchRef.current.startZoom * scaleRatio)
      );
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

  // Wheel zoom (manual event listener for passive: false)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleImageWheel = (e: WheelEvent) => {
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
    container.addEventListener("wheel", handleImageWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleImageWheel);
    };
  }, [containerWidth, containerHeight]);

  // Clamp pan if zoom/container changes
  useEffect(() => {
    setPan((p) => clampPan(p.x, p.y, zoom));
    // eslint-disable-next-line
  }, [zoom, containerWidth, containerHeight]);

  // Mouse hover events for desktop
  const handleMouseEnter = () => {
    if (!enlarged) setHovered(true);
  };
  const handleMouseLeave = () => {
    if (!enlarged) setHovered(false);
  };

  // Dynamic container style
  const containerStyle = {
    ...(isMobile
      ? {
          width: `${containerWidth * 1.5}px`,
          height: `${containerHeight * 1.5}px`,
        }
      : {
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
        }),
    zIndex: 99999,
    position: "absolute" as const,
    // Center on mobile, bottom-left corner on desktop
    ...(isMobile
      ? {
          left: "5px",
          bottom: "5px",
        }
      : {
          left: "50px",
          bottom: "50px",
        }),
    transition: "width 0.2s, height 0.2s",
  };

  // Image transform
  const tx = pan.x / zoom;
  const ty = pan.y / zoom;
  const imageTransform = `scale(${zoom}) translate(${tx}px, ${ty}px)`;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="relative rounded-2xl overflow-hidden bg-gray-200 border-4 border-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "transparent" }}
      >
        <CldImage
          src={imageSrc}
          width={imgW}
          height={imgH}
          alt="Campus location"
          className="block w-auto h-auto max-w-none max-h-none object-contain transition-opacity duration-500 opacity-100"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            transform: imageTransform,
            transformOrigin: "center center",
            transition: "transform 0.1s",
            cursor: "grab",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        />
      </div>
    </div>
  );
}
