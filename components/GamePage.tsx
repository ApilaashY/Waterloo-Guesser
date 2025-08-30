"use client";

import { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import Map from "./Map";
import LocationUploader from "./LocationUploader";

export default function GamePage() {
  const [showUploader, setShowUploader] = useState(false);
  // const [transformReady, setTransformReady] = useState(false);
  // const [transformReady, setTransformReady] = useState(false);
  interface State {
    image?: string;
    id?: string;
  }

  const [totalPoints, setTotalPoints] = useState(0);
  const [imageIDs, setImageIDs] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [state, setState] = useState<State>({});
  const [setupDone, setSetupDone] = useState(false);
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);

  const [imgOpacity, setImgOpacity] = useState<number | 0.8>(0.8);
  const hovering = useRef(false);

  const requestingImage = useRef(false);
  // Preloaded next image cache
  const preloadedNext = useRef<any | null>(null);

  // Preload the next image in the background and store response in preloadedNext
  function preloadNextImage() {
    // don't start another preload if one is already pending
    if (preloadedNext.current || requestingImage.current) return;
    const previous = [...imageIDs];
    fetch(`${process.env.NEXT_PUBLIC_LINK}/api/getPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previousCodes: previous }),
    })
      .then((res) => res.json())
      .then((json) => {
        // store the raw response for later use
        preloadedNext.current = json;
        // also start loading the image bytes so subsequent render is instant
        if (json?.image) {
          const img = new Image();
          img.src = json.image;
        }
      })
      .catch(() => {
        preloadedNext.current = null;
      });
  }

  function requestImage() {
    // If we have a preloaded image ready, use it immediately
    if (preloadedNext.current) {
      const json = preloadedNext.current;
      preloadedNext.current = null;

      if (imageIDs.includes(json.id)) setImageIDs([json.id]);
      else setImageIDs([...imageIDs, json.id]);

      // Set main state and private correct coords (don't display correct answer yet)
      const correctX = json.correctX ?? json.correct_x ?? json.xCoor ?? json.x ?? null;
      const correctY = json.correctY ?? json.correct_y ?? json.yCoor ?? json.y ?? null;
      setState(prev => ({ ...prev, ...json, correctX, correctY }));

      setXCoor(null);
      setYCoor(null);
      setXRightCoor(null);
      setYRightCoor(null);

      // Start preloading the next one
      preloadNextImage();
      return;
    }

    if (requestingImage.current) return;
    requestingImage.current = true;
    fetch(`${process.env.NEXT_PUBLIC_LINK}/api/getPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previousCodes: imageIDs }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (imageIDs.includes(json.id)) setImageIDs([json.id]);
        else setImageIDs([...imageIDs, json.id]);

        const correctX = json.correctX ?? json.correct_x ?? json.xCoor ?? json.x ?? null;
        const correctY = json.correctY ?? json.correct_y ?? json.yCoor ?? json.y ?? null;
        setState(prev => ({ ...prev, ...json, correctX, correctY }));

        setXCoor(null);
        setYCoor(null);
        setXRightCoor(null);
        setYRightCoor(null);
        requestingImage.current = false;

        // Preload next image in the background
        preloadNextImage();
      })
      .catch(() => {
        requestingImage.current = false;
      });
  }

  const validatingCoordinate = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Performance timing: record when image finishes loading and user interactions
  const imageLoadedAt = useRef<number | null>(null);
  const firstMapClickRecorded = useRef(false);
  const firstSubmitRecorded = useRef(false);

  function zoomToGuessAndAnswer() {
    const parent = mapContainerRef.current;
    if (
      !parent ||
      xCoor == null ||
      yCoor == null ||
      xRightCoor == null ||
      yRightCoor == null
    )
      return;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    let topleftX = (Math.min(xCoor, xRightCoor) - 0.05) * parentWidth;
    let topleftY = (Math.min(yCoor, yRightCoor) - 0.05) * parentHeight;
    const bottomrightX = (Math.max(xCoor, xRightCoor) + 0.05) * parentWidth;
    const bottomrightY = (Math.max(yCoor, yRightCoor) + 0.05) * parentHeight;
    const scaleX = (bottomrightX - topleftX) / parentWidth;
    const scaleY = (bottomrightY - topleftY) / parentHeight;
    const scale = 1 / Math.max(scaleX, scaleY);
    // Center the viewport
    if (scaleX > scaleY) {
      topleftY = (topleftY + bottomrightY) / 2 - parentHeight / scale / 2;
    } else {
      topleftX = (topleftX + bottomrightX) / 2 - parentWidth / scale / 2;
    }
    // Scroll the parent div to the calculated position
    parent.scrollTo({
      left: Math.max(0, -topleftX * scale),
      top: Math.max(0, -topleftY * scale),
      behavior: "smooth",
    });
  }

  function validateCoordinate() {
    if (validatingCoordinate.current) return;
    validatingCoordinate.current = true;

    // Prefer correct coords from state (versus) or from the loaded image metadata (single-player)
    const correctX = (state as any).correctX ?? xRightCoor ?? null;
    const correctY = (state as any).correctY ?? yRightCoor ?? null;

    const body: any = {
      xCoor: xCoor,
      yCoor: yCoor,
      id: state.id,
    };
    if (correctX != null && correctY != null) {
      body.correctX = correctX;
      body.correctY = correctY;
    }

    // Record time from image load to first submit (only once per image)
    if (imageLoadedAt.current && !firstSubmitRecorded.current) {
      const delta = Date.now() - imageLoadedAt.current;
      console.log(`[perf] Time from image load to submit: ${delta}ms`);
      firstSubmitRecorded.current = true;
    }

    fetch(`${process.env.NEXT_PUBLIC_LINK}/api/validateCoordinate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((json) => {
        setXRightCoor(json.xCoor);
        setYRightCoor(json.yCoor);
        setTotalPoints(totalPoints + json.points);
        setQuestionCount(questionCount + 1);
        validatingCoordinate.current = false;
        // Zoom and pan to show both dots
        zoomToGuessAndAnswer();
      });
  }

  useEffect(() => {
    if (setupDone) return;
    setSetupDone(true);
    requestImage();
  }, [requestImage, setupDone]);

  // Track natural size of the current image
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  // Utility: get natural image size by preloading an Image
  // Using a small effects-based loader keeps code simple and works with CldImage URLs
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);
    if (!state.image) return;

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      // Mark the image as loaded for performance timing
      imageLoadedAt.current = Date.now();
      firstMapClickRecorded.current = false;
      firstSubmitRecorded.current = false;
      console.log('[perf] Image loaded at', new Date(imageLoadedAt.current).toISOString());
    };
    img.onerror = () => {
      if (!mounted) return;
      setNaturalSize(null);
    };
    img.src = state.image;

    return () => {
      mounted = false;
    };
  }, [state.image]);

  // Add router for navigation
  const router = typeof window !== "undefined" ? require("next/navigation").useRouter() : null;

  // Hover zoom state for preview
  const [previewHover, setPreviewHover] = useState(false);
  // Scroll zoom state for preview image
  // Compute minimum zoom so image always fills the area
  const getMinZoom = () => {
    if (!naturalSize) return 1.0;
    const containerW = 280, containerH = 200;
    const imgW = naturalSize.w, imgH = naturalSize.h;
    const zoomW = containerW / imgW;
    const zoomH = containerH / imgH;
    return Math.max(zoomW, zoomH);
  };
  const minZoom = getMinZoom();
  const [previewZoom, setPreviewZoom] = useState(minZoom);

  // Update zoom when naturalSize changes to ensure it always fills the area
  useEffect(() => {
    if (naturalSize) {
      const newMinZoom = getMinZoom();
      setPreviewZoom(prev => Math.max(prev, newMinZoom));
    }
  }, [naturalSize]);

  // Pan state for dragging image
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse event handlers for panning
  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setPreviewHover(true); // Ensure hover state is active when starting to drag
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  // Check if mouse position is over the container
  const isMouseOverContainer = (clientX: number, clientY: number): boolean => {
    if (!containerRef.current) return false;
    const rect = containerRef.current.getBoundingClientRect();
    return clientX >= rect.left && clientX <= rect.right && 
           clientY >= rect.top && clientY <= rect.bottom;
  };

  // Global mouse event handlers for dragging outside the container
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (dragging) {
        setDragging(false);
        dragStart.current = null;
        // Only exit hover if mouse is not over the container
        if (!isMouseOverContainer(e.clientX, e.clientY)) {
          setPreviewHover(false);
        }
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragging || !dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setPan(prev => {
        // Calculate max pan so image can't be dragged out of bounds
        const containerW = 280, containerH = 200;
        const imgW = containerW * previewZoom;
        const imgH = containerH * previewZoom;
        const maxX = Math.max(0, (imgW - containerW) / 2);
        const maxY = Math.max(0, (imgH - containerH) / 2);
        let newX = prev.x + dx;
        let newY = prev.y + dy;
        newX = Math.max(-maxX, Math.min(maxX, newX));
        newY = Math.max(-maxY, Math.min(maxY, newY));
        return { x: newX, y: newY };
      });
    };

    if (dragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [dragging, previewZoom]);

  const handleImageMouseUp = () => {
    // This is now handled by the global handler
  };
  const handleImageMouseLeave = () => {
    // This is now handled by the global handler
  };
  const handleImageMouseMove = (e: React.MouseEvent) => {
    // This is now handled by the global handler
  };

  // Handle wheel event for zoom
  const handleImageWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const currentMinZoom = getMinZoom();
    setPreviewZoom(prevZoom => {
      const newZoom = prevZoom + delta;
      // Clamp zoom so image always fills the area
      return Math.max(currentMinZoom, Math.min(3, newZoom));
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 overflow-hidden">
      <button
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        onClick={() => setShowUploader((v) => !v)}
      >
        {showUploader ? "Back to Game" : "Add Location"}
      </button>
      <button
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
        onClick={() => {
          if (router) router.push("/queue-game");
          else window.location.href = "/queue-game";
        }}
      >
        Multiplayer Queue
      </button>
      {showUploader ? (
        <LocationUploader />
      ) : (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
          <div className="absolute top-4 left-4">
            <h1 className="text-xl font-bold text-gray-800 bg-white/80 rounded px-4 py-2 shadow">
              Points: {totalPoints}
            </h1>
          </div>
          <div className="absolute top-4 right-4 z-50">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              onClick={() => setShowUploader((v) => !v)}
            >
              {showUploader ? "Back to Game" : "Add Location"}
            </button>
          </div>
          <div className="flex items-center justify-center w-full h-full">
            <div
              ref={mapContainerRef}
              className="flex items-center justify-center w-full h-full max-w-4xl max-h-[80vh] mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative"
            >
              <Map
                xCoor={xCoor}
                yCoor={yCoor}
                setXCoor={
                  xRightCoor == null && yRightCoor == null
                    ? ((val: number | null) => {
                        // Record first map click timing once per image
                        if (imageLoadedAt.current && !firstMapClickRecorded.current) {
                          const delta = Date.now() - imageLoadedAt.current;
                          console.log(`[perf] Time from image load to first map click: ${delta}ms`);
                          firstMapClickRecorded.current = true;
                        }
                        setXCoor(val);
                      })
                    : () => {}
                }
                setYCoor={
                  xRightCoor == null && yRightCoor == null ? setYCoor : () => {}
                }
                xRightCoor={xRightCoor}
                yRightCoor={yRightCoor}
                disabled={xRightCoor != null && yRightCoor != null}
                aspectRatio={0.7 * (896 / 683)}
              />
              <div className="absolute top-4 right-4 z-50">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
                  onClick={() => {
                    return xRightCoor == null || yRightCoor == null
                      ? validateCoordinate()
                      : requestImage();
                  }}
                >
                  {xRightCoor == null || yRightCoor == null ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex justify-start items-start">
            {state.image && (
              // Show the image fully (no cropping) but constrained to a small preview box
              // Use a scale transform on hover to smoothly enlarge the image, then return to original size.
              // Allow overflow so scaled image isn't clipped
              <div
                ref={containerRef}
                className="rounded shadow relative"
                style={{ zIndex: 99999, overflow: 'visible' }}
                onMouseEnter={() => !dragging && setPreviewHover(true)}
                onMouseLeave={() => !dragging && setPreviewHover(false)}
              >
                {/* Container for scroll zoom - restricts zoom to this area */}
                <div
                  className="relative rounded overflow-hidden"
                  style={{
                    width: '280px',
                    height: '200px',
                    transform: previewHover ? 'scale(1.6)' : 'scale(1)',
                    transformOrigin: 'bottom left',
                    transition: 'transform 400ms ease'
                  }}
                >
                  <CldImage
                    src={state.image}
                    // request the natural size when available (fallback to a reasonable size)
                    width={naturalSize?.w ?? 800}
                    height={naturalSize?.h ?? 600}
                    alt="Campus location"
                    className="block object-contain rounded shadow"
                    onWheel={handleImageWheel}
                    onMouseDown={handleImageMouseDown}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      transition: 'transform 200ms ease',
                      transform: `scale(${previewZoom}) translate(${pan.x / previewZoom}px, ${pan.y / previewZoom}px)`,
                      transformOrigin: 'center center',
                      cursor: dragging ? 'grabbing' : 'grab'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
