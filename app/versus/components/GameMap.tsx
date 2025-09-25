import { forwardRef } from "react";
import SharedGameMap from "../../../components/GameMap";

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
  enlarged?: boolean; // Added prop to track enlarged state
  currentScore?: number; // Current round score
  overrideZoom?: number; // Optional zoom level
  setOverrideZoom?: React.Dispatch<React.SetStateAction<number>>; // Optional zoom setter
  overridePan?: { x: number; y: number }; // Optional pan position
  setOverridePan?: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >; // Optional pan setter
}

const GameMap = forwardRef<any, GameMapProps>(
  (
    {
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
      disabled = false,
      enlarged = false,
      currentScore = 0,
      overrideZoom,
      setOverrideZoom,
      overridePan,
      setOverridePan,
    },
    ref
  ) => {
    return (
      <div ref={mapContainerRef} className="relative w-full h-full">
        <SharedGameMap
          ref={ref}
          xCoor={xCoor}
          yCoor={yCoor}
          setXCoor={setXCoor}
          setYCoor={setYCoor}
          xRightCoor={xRightCoor}
          yRightCoor={yRightCoor}
          disabled={disabled}
          enlarged={enlarged}
          currentScore={currentScore}
          overrideZoom={overrideZoom}
          setOverrideZoom={setOverrideZoom}
          overridePan={overridePan}
          setOverridePan={setOverridePan}
        />

        {/* Result overlay for versus mode */}
        {showResult && isRoundComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Round Complete!</h2>
              <p className="mb-4">Score: {currentScore}</p>
              <button
                onClick={onContinue}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GameMap.displayName = "GameMap";

export default GameMap;
