import { forwardRef, useEffect, useRef as useReactRef, useState } from "react";
import Map from "./Map";
import {
  CONTAINER_WIDTH as DEFAULT_CONTAINER_WIDTH,
  CONTAINER_HEIGHT as DEFAULT_CONTAINER_HEIGHT,
  PAN_STEP,
  PAN_INTERVAL,
  ZOOM_STEP,
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_ANIMATION_STEP,
  ZOOM_ANIMATION_DELAY,
  PINCH_SENSITIVITY_THRESHOLD,
  MAX_SCORE,
} from "./constants/mapConstants";

interface GameMapProps {
  // Core coordinates
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;

  // Coordinate handling - flexible interface
  onCoordinateClick?: (x: number | null, y: number | null) => void;
  setXCoor?: (value: number) => void;
  setYCoor?: (value: number) => void;

  // Display and interaction
  disabled?: boolean;
  disableClickOnly?: boolean; // Allow zoom/pan but disable coordinate clicking
  enlarged?: boolean;
  currentScore?: number;

  // Optional zoom/pan control
  overrideZoom?: number;
  setOverrideZoom?: React.Dispatch<React.SetStateAction<number>>;
  overridePan?: { x: number; y: number };
  setOverridePan?: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;

  // Versus-specific props
  image?: string | undefined;
  showResult?: boolean;
  isRoundComplete?: boolean;
  onContinue?: () => void;
  mapContainerRef?: React.RefObject<HTMLDivElement | null>;
  triangleData?: any;
  userVertices?: (Array<{ x: number, y: number } | null>);
}

const GameMap = forwardRef<any, GameMapProps>(
  (
    {
      xCoor,
      yCoor,
      xRightCoor,
      yRightCoor,
      onCoordinateClick,
      setXCoor,
      setYCoor,
      disabled = false,
      disableClickOnly = false,
      enlarged = false,
      currentScore = 0,
      overrideZoom,
      setOverrideZoom,
      overridePan,
      setOverridePan,
      // Versus-specific props
      image,
      showResult = false,
      isRoundComplete = false,
      onContinue,
      mapContainerRef,
      triangleData,
      userVertices,
    },
    ref
  ) => {
    const panIntervalRef = useReactRef<NodeJS.Timeout | null>(null);
    const activeKeysRef = useReactRef<Set<string>>(new Set()); // Track all active keys
    const mapRef = useReactRef<any>(null); // Ref to access Map component

    const [internalZoom, setInternalZoom] = useState(1);
    const [internalPan, setInternalPan] = useState({ x: 0, y: 0 });

    const zoom = overrideZoom !== undefined ? overrideZoom : internalZoom;
    const setZoom = setOverrideZoom !== undefined ? setOverrideZoom : setInternalZoom;
    const pan = overridePan !== undefined ? overridePan : internalPan;
    const setPan = setOverridePan !== undefined ? setOverridePan : setInternalPan;
    const [containerDimensions, setContainerDimensions] = useState({
      width: DEFAULT_CONTAINER_WIDTH,
      height: DEFAULT_CONTAINER_HEIGHT,
    });
    const imageRef = useReactRef<HTMLImageElement | null>(null); // Ref to the image element
    const isAnimatingZoom = useReactRef(false);
    const isDragging = useReactRef(false);
    const dragStart = useReactRef({ x: 0, y: 0 });
    const panStart = useReactRef({ x: 0, y: 0 });
    const isPinching = useReactRef(false);
    const lastPinchDistance = useReactRef(0);
    const pinchCenter = useReactRef({ x: 0, y: 0 });

    // Performance optimization: Use refs for frequently changing values
    const zoomRef = useReactRef(zoom);
    const panRef = useReactRef(pan);
    const cachedImageRect = useReactRef<DOMRect | null>(null);
    const wheelThrottleRef = useReactRef<number | null>(null);

    // Update refs when state changes
    useEffect(() => {
      zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
      panRef.current = pan;
    }, [pan]);

    // Performance optimization: Cache image rect and update only when needed
    const updateCachedImageRect = () => {
      if (imageRef.current) {
        cachedImageRect.current = imageRef.current.getBoundingClientRect();
      }
    };

    const getCachedImageRect = () => {
      if (!cachedImageRect.current && imageRef.current) {
        updateCachedImageRect();
      }
      return cachedImageRect.current;
    };

    // Clamp pan so the map always stays within its container
    const clampPan = (x: number, y: number, zoomLevel = 1) => {
      if (zoomLevel <= 1) {
        // When not zoomed in, don't allow any panning
        return { x: 0, y: 0 };
      }

      const { width, height } = getImageDimensions();

      const borderx = width / 2 - width / 2 / zoomLevel;
      const bordery = height / 2 - height / 2 / zoomLevel;

      const clampedX = Math.min(borderx, Math.max(-borderx, x));
      const clampedY = Math.min(bordery, Math.max(-bordery, y));

      return {
        x: clampedX,
        y: clampedY,
      };
    };

    // Function to animate zooming
    async function animateZoom(targetZoom: number) {
      if (isAnimatingZoom.current) return; // Prevent overlapping animations
      isAnimatingZoom.current = true;

      let prev = zoom;

      while (prev !== targetZoom) {
        if (prev < targetZoom) {
          prev = Math.min(prev + ZOOM_ANIMATION_STEP, targetZoom);
        } else {
          prev = Math.max(prev - ZOOM_ANIMATION_STEP, targetZoom);
        }
        setZoom(prev);
        await new Promise((resolve) =>
          setTimeout(resolve, ZOOM_ANIMATION_DELAY)
        );
      }
      isAnimatingZoom.current = false;
    }

    // Reset pan when zoom changes to ensure proper bounds
    useEffect(() => {
      setPan((prev: { x: number; y: number }) =>
        clampPan(prev.x, prev.y, zoom)
      );
    }, [zoom]);

    // Update container dimensions when map ref is available
    useEffect(() => {
      const updateDimensions = () => {
        if (mapRef.current) {
          const mapElement = mapRef.current.querySelector?.(".MapPicture");
          if (mapElement) {
            setContainerDimensions({
              width: mapElement.clientWidth,
              height: mapElement.clientHeight,
            });
          }
        }
        // Update cached image rect when dimensions change
        updateCachedImageRect();
      };

      // Update dimensions initially and on resize
      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }, [mapRef.current]);

    useEffect(() => {
      if (disabled || enlarged) return; // Disable all interactions if disabled or enlarged is true

      const panKeys = [
        "arrowup",
        "arrowleft",
        "arrowdown",
        "arrowright",
        "w",
        "a",
        "s",
        "d",
      ]; // Added WASD keys
      const zoomKeys = ["1", "2", "3"]; // Zoom preset keys
      const cornerKeys = ["q", "e", "z", "c"];

      // Handle wheel/scroll events for zooming (with performance optimization)
      const handleWheel = (e: WheelEvent) => {
        if (disabled || enlarged) return;

        e.preventDefault();

        // Throttle wheel events for better performance
        if (wheelThrottleRef.current) {
          cancelAnimationFrame(wheelThrottleRef.current);
        }

        wheelThrottleRef.current = requestAnimationFrame(() => {
          const currentZoom = zoomRef.current;
          const currentPan = panRef.current;

          let newZoom = currentZoom;

          if (e.deltaY < 0) {
            // Scrolling up - zoom in
            newZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
          } else {
            // Scrolling down - zoom out
            newZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
          }

          if (newZoom !== currentZoom) {
            // Use cached image rect for better performance
            const imageRect = getCachedImageRect();
            if (imageRect) {
              // Mouse position relative to the image
              const mouseX = e.clientX - imageRect.left;
              const mouseY = e.clientY - imageRect.top;

              // Mouse position relative to image center
              const mouseOffsetX = mouseX - imageRect.width / 2;
              const mouseOffsetY = mouseY - imageRect.height / 2;

              // Calculate new pan to keep the point under the cursor fixed
              // With transform: scale(zoom) translate(pan), a point P on the image appears at:
              // screenPos = imageCenter + P * zoom + pan
              //
              // The point under the cursor in image coordinates is at mouseOffset (from center)
              // Before zoom: screenPos = center + mouseOffset * currentZoom + currentPan
              // After zoom:  screenPos = center + mouseOffset * newZoom + newPan
              //
              // For the cursor point to stay fixed:
              // mouseOffset * currentZoom + currentPan = mouseOffset * newZoom + newPan
              // newPan = mouseOffset * currentZoom - mouseOffset * newZoom + currentPan
              // newPan = mouseOffset * (currentZoom - newZoom) + currentPan

              // Calculate new pan to keep the point under the cursor fixed
              // With transform: scale(zoom) translate(pan), the translation is scaled.
              // Formula derived: NewPan = P_i * (OldZoom/NewZoom - 1) + OldPan * (OldZoom/NewZoom)
              // Where P_i = mouseOffset / currentZoom

              const ratio = currentZoom / newZoom;
              const pX = mouseOffsetX / currentZoom;
              const pY = mouseOffsetY / currentZoom;

              const newPanX = pX * (ratio - 1) + currentPan.x * ratio;
              const newPanY = pY * (ratio - 1) + currentPan.y * ratio;

              // Clamp the new pan to valid bounds
              const clampedPan = clampPan(newPanX, newPanY, newZoom);

              // Set the new zoom and pan simultaneously
              setZoom(newZoom);
              setPan(clampedPan);
            } else {
              // Fallback to center zoom if image rect not available
              animateZoom(newZoom);
            }
          }
        });
      };

      // Handle mouse events for dragging (optimized with refs)
      const handleMouseDown = (e: MouseEvent) => {
        // Only handle left mouse button
        if (e.button !== 0 || disabled || enlarged || zoomRef.current <= 1)
          return;

        e.preventDefault();
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { x: panRef.current.x, y: panRef.current.y };
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || disabled || enlarged) return;

        e.preventDefault();

        const currentZoom = zoomRef.current;
        const deltaX = (e.clientX - dragStart.current.x) / currentZoom;
        const deltaY = (e.clientY - dragStart.current.y) / currentZoom;

        const newPan = clampPan(
          panStart.current.x + deltaX,
          panStart.current.y + deltaY,
          currentZoom
        );

        setPan(newPan);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isDragging.current) return;

        e.preventDefault();
        isDragging.current = false;
      };

      // Handle mouse leave to end dragging if mouse leaves the window
      const handleMouseLeave = () => {
        if (isDragging.current) {
          isDragging.current = false;
        }
      };

      // Helper function to get distance between two touch points
      const getTouchDistance = (touch1: Touch, touch2: Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      // Helper function to get center point between two touches
      const getTouchCenter = (touch1: Touch, touch2: Touch) => {
        return {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };
      };

      // Handle touch events for pinch-to-zoom (optimized)
      const handleTouchStart = (e: TouchEvent) => {
        if (disabled || enlarged) return;

        if (e.touches.length === 2) {
          // Two fingers - start pinch gesture
          e.preventDefault();
          isPinching.current = true;
          isDragging.current = false; // Stop any dragging

          const touch1 = e.touches[0];
          const touch2 = e.touches[1];

          lastPinchDistance.current = getTouchDistance(touch1, touch2);
          pinchCenter.current = getTouchCenter(touch1, touch2);

          // Update cached image rect for pinch operations
          updateCachedImageRect();
        } else if (e.touches.length === 1) {
          // Single finger
          const currentZoom = zoomRef.current;
          if (currentZoom > 1) {
            // Only allow panning when zoomed in
            isDragging.current = true;
            dragStart.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
            panStart.current = { x: panRef.current.x, y: panRef.current.y };
          }
          // Reset pinch state for single finger
          isPinching.current = false;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (disabled || enlarged) return;

        if (e.touches.length === 2 && isPinching.current) {
          // Two fingers - handle pinch zoom
          e.preventDefault();

          const touch1 = e.touches[0];
          const touch2 = e.touches[1];

          const currentDistance = getTouchDistance(touch1, touch2);
          const currentCenter = getTouchCenter(touch1, touch2);

          if (lastPinchDistance.current > 0) {
            // Calculate zoom change based on distance change
            const distanceRatio = currentDistance / lastPinchDistance.current;

            // Only process if change is significant (performance optimization)
            if (Math.abs(distanceRatio - 1) > PINCH_SENSITIVITY_THRESHOLD) {
              const currentZoom = zoomRef.current;
              const currentPan = panRef.current;

              const zoomMultiplier = distanceRatio;
              const newZoom = currentZoom * zoomMultiplier;

              const clampedZoom = Math.min(
                MAX_ZOOM,
                Math.max(MIN_ZOOM, newZoom)
              );

              if (Math.abs(clampedZoom - currentZoom) > 0.01) {
                // Use cached image rect for better performance
                const imageRect = getCachedImageRect();
                if (imageRect) {
                  // Pinch center relative to the image
                  const centerX = currentCenter.x - imageRect.left;
                  const centerY = currentCenter.y - imageRect.top;

                  // Pinch center relative to image center
                  const centerOffsetX = centerX - imageRect.width / 2;
                  const centerOffsetY = centerY - imageRect.height / 2;

                  // Calculate new pan to keep the point under the pinch center fixed
                  // Same formula as wheel zoom
                  // Calculate new pan to keep the point under the pinch center fixed

                  const ratio = currentZoom / clampedZoom;
                  const pX = centerOffsetX / currentZoom;
                  const pY = centerOffsetY / currentZoom;

                  const newPanX = pX * (ratio - 1) + currentPan.x * ratio;
                  const newPanY = pY * (ratio - 1) + currentPan.y * ratio;

                  // Clamp the new pan to valid bounds
                  const clampedPan = clampPan(newPanX, newPanY, clampedZoom);

                  // Set zoom and pan simultaneously
                  setZoom(clampedZoom);
                  setPan(clampedPan);
                } else {
                  // Fallback: just set zoom without pan adjustment
                  setZoom(clampedZoom);
                }
              }
            }
          }

          lastPinchDistance.current = currentDistance;
          pinchCenter.current = currentCenter;
        } else if (
          e.touches.length === 1 &&
          isDragging.current &&
          !isPinching.current
        ) {
          // Single finger - handle panning
          e.preventDefault();

          const touch = e.touches[0];
          const currentZoom = zoomRef.current;
          const deltaX = (touch.clientX - dragStart.current.x) / currentZoom;
          const deltaY = (touch.clientY - dragStart.current.y) / currentZoom;

          const newPan = clampPan(
            panStart.current.x + deltaX,
            panStart.current.y + deltaY,
            currentZoom
          );

          setPan(newPan);
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (disabled || enlarged) return;

        if (e.touches.length === 0) {
          // No fingers - end all gestures
          isPinching.current = false;
          isDragging.current = false;
          lastPinchDistance.current = 0;
        } else if (e.touches.length === 1 && isPinching.current) {
          // Went from 2 fingers to 1 finger - end pinch, potentially start pan
          isPinching.current = false;
          lastPinchDistance.current = 0;

          // If zoomed in, start panning with the remaining finger
          const currentZoom = zoomRef.current;
          if (currentZoom > 1) {
            isDragging.current = true;
            dragStart.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
            panStart.current = { x: panRef.current.x, y: panRef.current.y };
          }
        } else if (e.touches.length >= 2 && !isPinching.current) {
          // Went from 1 finger to 2+ fingers - potentially start pinch
          isDragging.current = false;

          if (e.touches.length === 2) {
            isPinching.current = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastPinchDistance.current = getTouchDistance(touch1, touch2);
            pinchCenter.current = getTouchCenter(touch1, touch2);

            // Update cached rect when starting new pinch
            updateCachedImageRect();
          }
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        if (!enlarged) {
          if (zoomKeys.includes(key)) {
            e.preventDefault();
            let newZoom;
            switch (key) {
              case "1":
                newZoom = 1;
                break;
              case "2":
                newZoom = 3;
                break;
              case "3":
                newZoom = 5;
                break;
            }

            if (newZoom !== undefined) {
              animateZoom(newZoom);
            }
          } else if (cornerKeys.includes(key)) {
            e.preventDefault();
            const { width, height } = getImageDimensions();
            const currentZoom = zoomRef.current;
            const totalWidth = width / 2 - width / 2 / currentZoom;
            const totalHeight = height / 2 - height / 2 / currentZoom;
            switch (key) {
              case "q":
                setPan(clampPan(totalWidth, totalHeight, currentZoom));
                break;
              case "e":
                setPan(clampPan(-totalWidth, totalHeight, currentZoom));
                break;
              case "z":
                setPan(clampPan(totalWidth, -totalHeight, currentZoom));
                break;
              case "c":
                setPan(clampPan(-totalWidth, -totalHeight, currentZoom));
                break;
            }
          } else if (key === "shift" || key === "escape") {
            e.preventDefault();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          } else if (panKeys.includes(key)) {
            e.preventDefault();

            activeKeysRef.current.add(key);
            if (!panIntervalRef.current) {
              panIntervalRef.current = setInterval(() => {
                setPan((prev: { x: number; y: number }) => {
                  let deltaX = 0;
                  let deltaY = 0;
                  const currentZoom = zoomRef.current;
                  activeKeysRef.current.forEach((activeKey) => {
                    switch (activeKey) {
                      case "w":
                      case "arrowup":
                        deltaY += PAN_STEP / currentZoom;
                        break;
                      case "a":
                      case "arrowleft":
                        deltaX += PAN_STEP / currentZoom;
                        break;
                      case "s":
                      case "arrowdown":
                        deltaY -= PAN_STEP / currentZoom;
                        break;
                      case "d":
                      case "arrowright":
                        deltaX -= PAN_STEP / currentZoom;
                        break;
                    }
                  });
                  return clampPan(
                    prev.x + deltaX,
                    prev.y + deltaY,
                    currentZoom
                  );
                });
              }, PAN_INTERVAL);
            }
          }
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (panKeys.includes(key)) {
          activeKeysRef.current.delete(key);
          if (activeKeysRef.current.size === 0 && panIntervalRef.current) {
            clearInterval(panIntervalRef.current);
            panIntervalRef.current = null;
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      // Add wheel event listener to the document for broader capture
      document.addEventListener("wheel", handleWheel, { passive: false });

      // Add mouse event listeners for dragging
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseLeave);

      // Add touch event listeners for pinch-to-zoom and touch panning
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd, { passive: false });

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);

        // Remove wheel event listener
        document.removeEventListener("wheel", handleWheel);

        // Remove mouse event listeners
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mouseleave", handleMouseLeave);

        // Remove touch event listeners
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);

        if (panIntervalRef.current) {
          clearInterval(panIntervalRef.current);
          panIntervalRef.current = null;
        }

        // Clean up wheel throttling
        if (wheelThrottleRef.current) {
          cancelAnimationFrame(wheelThrottleRef.current);
          wheelThrottleRef.current = null;
        }

        // Clear cached rect on cleanup
        cachedImageRect.current = null;
      };
    }, [disabled, enlarged, zoom]); // Removed 'pan' from dependency array for better performance

    const getImageDimensions = () => {
      if (imageRef.current) {
        return {
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        };
      }

      // Fallback to the container dimensions or hardcoded values
      return containerDimensions;
    };

    // Helper function to handle coordinate clicks - supports both callback patterns
    const handleCoordinateClick = (x: number | null, y: number | null) => {
      // Prevent coordinate clicking when disabled or disableClickOnly is true
      if (disabled || disableClickOnly) return;

      if (onCoordinateClick) {
        onCoordinateClick(x, y);
      } else {
        if (x !== null && setXCoor) setXCoor(x);
        if (y !== null && setYCoor) setYCoor(y);
      }
    };

    // Determine container element - use provided ref or create wrapper
    const mapContent = (
      <Map
        ref={(mapInstance) => {
          mapRef.current = mapInstance;
          if (ref) {
            if (typeof ref === "function") {
              ref(mapInstance);
            } else {
              ref.current = mapInstance;
            }
          }
        }}
        xCoor={xCoor}
        yCoor={yCoor}
        setXCoor={
          disabled || disableClickOnly
            ? () => { }
            : (val: number | null) => handleCoordinateClick(val, null)
        }
        setYCoor={
          disabled || disableClickOnly
            ? () => { }
            : (val: number | null) => handleCoordinateClick(null, val)
        }
        onMapClick={
          disabled || disableClickOnly
            ? undefined
            : handleCoordinateClick
        }
        xRightCoor={xRightCoor}
        yRightCoor={yRightCoor}
        disabled={disabled}
        showScoreDisplay={true}
        currentScore={currentScore}
        maxScore={MAX_SCORE}
        zoom={zoom}
        pan={pan}
        imageRef={imageRef}
        triangleData={triangleData}
        userVertices={userVertices}
      />
    );

    // If this is being used in versus mode (has showResult prop), render with container
    if (showResult !== undefined && mapContainerRef) {
      return (
        <div
          className="relative w-full flex-1 mb-4 rounded-lg overflow-hidden min-h-[400px]"
          ref={mapContainerRef}
        >
          {mapContent}
          {showResult && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="p-4 text-center bg-white rounded-lg shadow-md">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Result
                </p>
                <p className="text-gray-700 mb-4">
                  {`Your guess was ${xCoor}, ${yCoor}.`}
                </p>
                <p className="text-gray-700 mb-4">
                  {`Correct answer is ${xRightCoor}, ${yRightCoor}.`}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  {isRoundComplete ? "Round Complete!" : "Round In Progress"}
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={onContinue}
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Otherwise, return just the map (for regular game mode)
    return mapContent;
  }
);

GameMap.displayName = "GameMap";

export default GameMap;
