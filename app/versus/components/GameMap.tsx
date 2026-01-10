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
      </div>
    );
  }
);

GameMap.displayName = "GameMap";

export default GameMap;
