import React from 'react';
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
  return (
    <div className="relative w-full h-96 mb-4 rounded-lg overflow-hidden" ref={mapContainerRef}>
      <Map
        xCoor={xCoor}
        yCoor={yCoor}
        setXCoor={setXCoor}
        setYCoor={setYCoor}
        xRightCoor={xRightCoor}
        yRightCoor={yRightCoor}
        disabled={disabled}
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
              {isRoundComplete ? 'Round Complete!' : 'Round In Progress'}
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
