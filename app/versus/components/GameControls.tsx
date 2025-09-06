interface GameControlsProps {
  onSubmit: () => void;
  opponentHasSubmitted: boolean;
  isRoundComplete: boolean;
  hasSubmitted: boolean; // Added new prop
  xCoor: number | null; // Added new prop
  yCoor: number | null; // Added new prop
}

const GameControls: React.FC<GameControlsProps> = ({
  onSubmit,
  opponentHasSubmitted,
  isRoundComplete,
  hasSubmitted,
  xCoor,
  yCoor,
}) => {
  // Button logic
  let submitLabel = "Submit";
  let submitDisabled = false;
  if (isRoundComplete) {
    submitLabel = "Next Round";
    submitDisabled = true;
  } else if (hasSubmitted) {
    submitLabel = "Waiting for opponent...";
    submitDisabled = true;
  } else if (xCoor === null || yCoor === null) {
    submitLabel = "Place your guess";
    submitDisabled = true;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4">
      <div className="flex-1">
        <button
          onClick={onSubmit}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default GameControls;
