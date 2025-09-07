import { forwardRef, useEffect, useRef as useReactRef } from "react";
import Map from "../../Map";

interface GameMapProps {
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
  onCoordinateClick: (x: number | null, y: number | null) => void;
  disabled: boolean;
  enlarged: boolean; // Added prop to track enlarged state from ImagePreview
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
    },
    ref
  ) => {
    const panIntervalRef = useReactRef<NodeJS.Timeout | null>(null);
    const activeKeysRef = useReactRef<Set<string>>(new Set()); // Track all active keys

    // Clamp pan so the map always stays within its container
    const clampPan = (x: number, y: number, zoomLevel = 1) => {
      if (zoomLevel <= 1) {
        return { x: 0, y: 0 };
      }
      const containerWidth = 896; // Example container width, adjust as needed
      const containerHeight = 683; // Example container height, adjust as needed
      const mapWidth = containerWidth * zoomLevel;
      const mapHeight = containerHeight * zoomLevel;
      const maxX = Math.max(0, (mapWidth - containerWidth) / 2);
      const maxY = Math.max(0, (mapHeight - containerHeight) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    };

    useEffect(() => {
      if (disabled || enlarged) return; // Disable movement if enlarged is true

      const PAN_STEP = 600;
      const PAN_INTERVAL = 30; // ms (smoother, ~60fps)
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

      const handleKeyDown = (e: KeyboardEvent) => {
        console.log(`Key pressed: ${e.key}`); // Debugging log to confirm key press

        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "SELECT"
        ) {
          return;
        }

        if (!ref || typeof ref === "function") return;
        if (!ref.current) return;

        if (disabled) return;

        const key = e.key.toLowerCase();

        switch (key) {
          case "q":
            console.log("Calling panToTopLeft");
            console.log("ref.current:", ref.current); // Debugging log to inspect ref.current
            ref.current.panToTopLeft?.();
            e.preventDefault();
            break;
          case "e":
            ref.current.panToTopRight?.();
            e.preventDefault();
            break;
          case "z":
            ref.current.panToBottomLeft?.();
            e.preventDefault();
            break;
          case "c":
            ref.current.panToBottomRight?.();
            e.preventDefault();
            break;
          case "1":
            ref.current.setZoom?.(1); // Zoom preset 1
            e.preventDefault();
            break;
          case "2":
            ref.current.setZoom?.(2); // Zoom preset 2
            e.preventDefault();
            break;
          case "3":
            ref.current.setZoom?.(3); // Zoom preset 3
            e.preventDefault();
            break;
        }

        if (panKeys.includes(key)) {
          activeKeysRef.current.add(key);
          if (!panIntervalRef.current) {
            panIntervalRef.current = setInterval(() => {
              let deltaX = 0;
              let deltaY = 0;
              activeKeysRef.current.forEach((activeKey) => {
                switch (activeKey) {
                  case "arrowup":
                  case "w":
                    deltaY += PAN_STEP;
                    break;
                  case "arrowleft":
                  case "a":
                    deltaX += PAN_STEP;
                    break;
                  case "arrowdown":
                  case "s":
                    deltaY -= PAN_STEP;
                    break;
                  case "arrowright":
                  case "d":
                    deltaX -= PAN_STEP;
                    break;
                }
              });
              const currentPan = ref.current.getPan?.() || { x: 0, y: 0 };
              const currentZoom = ref.current.getZoom?.() || 1;
              const newPan = clampPan(
                currentPan.x + deltaX,
                currentPan.y + deltaY,
                currentZoom
              );
              ref.current.panBy?.(
                newPan.x - currentPan.x,
                newPan.y - currentPan.y
              );
            }, PAN_INTERVAL);
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
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        if (panIntervalRef.current) {
          clearInterval(panIntervalRef.current);
          panIntervalRef.current = null;
        }
      };
    }, [disabled, enlarged, ref]); // Added enlarged to dependency array

    return (
      <Map
        ref={ref}
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
        aspectRatio={0.7 * (896 / 683)}
        showScoreDisplay={true}
        currentScore={850}
        maxScore={1000}
      />
    );
  }
);

GameMap.displayName = "GameMap";

export default GameMap;
