import { forwardRef, useEffect, useRef as useReactRef, useState } from "react";
import Map from "../../Map";

interface GameMapProps {
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
  onCoordinateClick: (x: number | null, y: number | null) => void;
  disabled: boolean;
  enlarged: boolean; // Added prop to track enlarged state from ImagePreview
  currentScore: number; // Current round score
}

const GameMap = forwardRef<any, GameMapProps>(
  (
    {
      xCoor,
      yCoor,
      xRightCoor,
      yRightCoor,
      onCoordinateClick,
      disabled,
      enlarged,
      currentScore,
    },
    ref
  ) => {
    const panIntervalRef = useReactRef<NodeJS.Timeout | null>(null);
    const activeKeysRef = useReactRef<Set<string>>(new Set()); // Track all active keys
    const mapRef = useReactRef<any>(null); // Ref to access Map component
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [containerDimensions, setContainerDimensions] = useState({
      width: 765,
      height: 350,
    });
    const imageRef = useReactRef<HTMLImageElement | null>(null); // Ref to the image element
    const isAnimatingZoom = useReactRef(false);
    const isDragging = useReactRef(false);
    const dragStart = useReactRef({ x: 0, y: 0 });
    const panStart = useReactRef({ x: 0, y: 0 });

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
          prev = Math.min(prev + 0.05, targetZoom);
        } else {
          prev = Math.max(prev - 0.05, targetZoom);
        }
        setZoom(prev);
        await new Promise((resolve) => setTimeout(resolve, 4));
      }
      isAnimatingZoom.current = false;
    }

    // Reset pan when zoom changes to ensure proper bounds
    useEffect(() => {
      setPan((prev) => clampPan(prev.x, prev.y, zoom));
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
      };

      // Update dimensions initially and on resize
      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }, [mapRef.current]);

    useEffect(() => {
      if (disabled || enlarged) return; // Disable movement if enlarged is true

      const PAN_STEP = 4;
      const PAN_INTERVAL = 10; // ms (smoother, ~60fps)
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

      // Handle wheel/scroll events for zooming
      const handleWheel = (e: WheelEvent) => {
        if (disabled || enlarged) return;

        e.preventDefault();

        const zoomStep = 0.3; // Increased for more responsive zooming
        const minZoom = 1;
        const maxZoom = 5;

        let newZoom = zoom;

        if (e.deltaY < 0) {
          // Scrolling up - zoom in
          newZoom = Math.min(zoom + zoomStep, maxZoom);
        } else {
          // Scrolling down - zoom out
          newZoom = Math.max(zoom - zoomStep, minZoom);
        }

        if (newZoom !== zoom) {
          animateZoom(newZoom);
        }
      };

      // Handle mouse events for dragging
      const handleMouseDown = (e: MouseEvent) => {
        // Only handle left mouse button
        if (e.button !== 0 || disabled || enlarged || zoom <= 1) return;

        e.preventDefault();
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        panStart.current = { x: pan.x, y: pan.y };
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || disabled || enlarged) return;

        e.preventDefault();

        const deltaX = (e.clientX - dragStart.current.x) / zoom;
        const deltaY = (e.clientY - dragStart.current.y) / zoom;

        const newPan = clampPan(
          panStart.current.x + deltaX,
          panStart.current.y + deltaY,
          zoom
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
            const totalWidth = width / 2 - width / 2 / zoom;
            const totalHeight = height / 2 - height / 2 / zoom;
            switch (key) {
              case "q":
                setPan(clampPan(totalWidth, totalHeight, zoom));
                break;
              case "e":
                setPan(clampPan(-totalWidth, totalHeight, zoom));
                break;
              case "z":
                setPan(clampPan(totalWidth, -totalHeight, zoom));
                break;
              case "c":
                setPan(clampPan(-totalWidth, -totalHeight, zoom));
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
                setPan((prev) => {
                  let deltaX = 0;
                  let deltaY = 0;
                  activeKeysRef.current.forEach((activeKey) => {
                    switch (activeKey) {
                      case "w":
                      case "arrowup":
                        deltaY += PAN_STEP / zoom;
                        break;
                      case "a":
                      case "arrowleft":
                        deltaX += PAN_STEP / zoom;
                        break;
                      case "s":
                      case "arrowdown":
                        deltaY -= PAN_STEP / zoom;
                        break;
                      case "d":
                      case "arrowright":
                        deltaX -= PAN_STEP / zoom;
                        break;
                    }
                  });
                  return clampPan(prev.x + deltaX, prev.y + deltaY, zoom);
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

        if (panIntervalRef.current) {
          clearInterval(panIntervalRef.current);
          panIntervalRef.current = null;
        }
      };
    }, [disabled, enlarged, zoom, pan]); // Added pan to dependency array

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

    return (
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
          disabled
            ? () => {}
            : (val: number | null) => onCoordinateClick(val, null)
        }
        setYCoor={
          disabled
            ? () => {}
            : (val: number | null) => onCoordinateClick(null, val)
        }
        xRightCoor={xRightCoor}
        yRightCoor={yRightCoor}
        disabled={disabled}
        showScoreDisplay={true}
        currentScore={currentScore}
        maxScore={1000}
        zoom={zoom}
        pan={pan}
        imageRef={imageRef}
      />
    );
  }
);

GameMap.displayName = "GameMap";

export default GameMap;
