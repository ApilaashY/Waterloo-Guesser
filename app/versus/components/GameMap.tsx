import React, { useRef, useState } from "react";
import Map from "../../../components/Map";

interface GameMapProps {
  image: string | undefined;
  xCoor: number | null;
  yCoor: number | null;
  setXCoor: (value: number) => void;
  setYCoor: (value: number) => void;
  xRightCoor: number | null;
  yRightCoor: number | null;
  showResult: boolean;
  isRoundComplete: boolean;
  onContinue: () => void;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

export default function GameMap({
  image,
  xCoor,
  yCoor,
  setXCoor,
  setYCoor,
  xRightCoor,
  yRightCoor,
  showResult,
  isRoundComplete,
  onContinue,
  mapContainerRef,
  disabled,
}: GameMapProps) {
  // Fast-paced WASD/arrow movement logic
  const mapRef = React.useRef<any>(null);
  const panIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const activeKeysRef = React.useRef<Set<string>>(new Set());
  const PAN_STEP = 60; // px per tick
  const PAN_INTERVAL = 10; // ms
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null); // Ref to the image element

  React.useEffect(() => {
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
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (panKeys.includes(key)) {
        activeKeysRef.current.add(key);
        if (!panIntervalRef.current) {
          panIntervalRef.current = setInterval(() => {
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
            if (mapRef.current && mapRef.current.panBy) {
              mapRef.current.panBy(deltaX, deltaY);
            }
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
  }, []);

  return (
    <div
      className="relative w-full h-96 mb-4 rounded-lg overflow-hidden"
      ref={mapContainerRef}
    >
      <Map
        ref={mapRef}
        xCoor={xCoor}
        yCoor={yCoor}
        setXCoor={setXCoor}
        setYCoor={setYCoor}
        xRightCoor={xRightCoor}
        yRightCoor={yRightCoor}
        disabled={disabled}
        currentScore={0}
        zoom={zoom}
        pan={pan}
        imageRef={imageRef}
      />
      {showResult && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 text-center bg-white rounded-lg shadow-md">
            <p className="text-lg font-semibold text-gray-800 mb-2">Result</p>
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
