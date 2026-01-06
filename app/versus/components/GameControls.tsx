import { useEffect, useState } from 'react';

interface GameControlsProps {
  onSubmit: () => void;
  opponentHasSubmitted: boolean;
  isRoundComplete: boolean;
  hasSubmitted: boolean;
  xCoor: number | null;
  yCoor: number | null;
  score: number;
  partnerScore: number;
  round: number;
  maxRounds: number;
  playerName: string; // Add playerName prop for display
}

const GameControls: React.FC<GameControlsProps> = ({
  onSubmit,
  opponentHasSubmitted,
  isRoundComplete,
  hasSubmitted,
  xCoor,
  yCoor,
  score,
  partnerScore,
  round,
  maxRounds,
  playerName
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Button logic
  let submitLabel = "Submit";
  let submitDisabled = false;
  let buttonColorClass = "bg-yellow-400 hover:bg-yellow-500"; // Default yellow like GamePage

  if (isRoundComplete) {
    submitLabel = "Round Complete"; // The parent handles "Next Round" button separately currently, or we can integrate it.
    // In VersusPage, "Next Round" is a separate button. Let's keep this as status.
    submitDisabled = true;
    buttonColorClass = "bg-gray-400 cursor-not-allowed";
  } else if (hasSubmitted) {
    submitLabel = "Waiting for opponent...";
    submitDisabled = true;
    buttonColorClass = "bg-yellow-600 hover:bg-yellow-700";
  } else if (xCoor === null || yCoor === null) {
    submitLabel = "Place your guess";
    submitDisabled = true;
    buttonColorClass = "opacity-50 cursor-not-allowed bg-yellow-400";
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Check if focus is on a form element
      const activeElement = document.activeElement;
      const isFormElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );
      if (isFormElement) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!submitDisabled && !hasSubmitted) {
          onSubmit();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [hasSubmitted, submitDisabled, onSubmit]);

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <>
      {/* Points display at top left of container */}
      <div className="absolute top-4 left-4 z-50 w-[calc(100%-2rem)]">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-4 py-3 text-gray-800">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
            <span className="font-bold text-blue-700 truncate mr-2">{playerName || "You"}</span>
            <span className="font-bold text-lg">{score} pts</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Opponent</span>
            <span className="font-semibold">{partnerScore} pts</span>
          </div>
        </div>
      </div>

      {/* Round display */}
      <div className="absolute top-32 left-4 z-50">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-6 py-2 text-lg font-bold text-gray-800">
          Round: {round} / {maxRounds}
        </div>
      </div>

      {/* Home and Help icons */}
      <div className="absolute top-48 left-4 z-50 flex flex-row gap-2">
        <button
          className="bg-white rounded-lg border-2 border-gray-300 shadow flex items-center justify-center w-10 h-10 hover:bg-gray-100"
          onClick={handleHomeClick}
          aria-label="Go to homepage"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <path d="M3 9.5L12 3l9 6.5" />
            <path d="M4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10" />
          </svg>
        </button>
        <button
          className="bg-white rounded-lg border-2 border-gray-300 shadow hidden md:flex items-center justify-center w-10 h-10 hover:bg-gray-100 relative"
          onMouseEnter={() => setShowShortcuts(true)}
          onMouseLeave={() => setShowShortcuts(false)}
          onClick={() => setShowShortcuts(!showShortcuts)}
          aria-label="Show keyboard shortcuts"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          {/* Shortcuts tooltip */}
          {showShortcuts && (
            <div className="absolute left-12 top-0 bg-gray-800 text-white text-sm rounded-lg p-3 whitespace-nowrap shadow-lg z-60 hidden md:block">
              <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
              <div className="space-y-1">
                <div><span className="font-mono bg-gray-700 px-1 rounded">Space</span> or <span className="font-mono bg-gray-700 px-1 rounded">Enter</span> - Submit</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Mouse Wheel</span> - Zoom in/out</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Click + Drag</span> - Pan image</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Click</span> - Place guess marker</div>
                <div>
                  <span className="font-mono bg-gray-700 px-1 rounded">W</span>A<span className="font-mono bg-gray-700 px-1 rounded">S</span>D - Pan map
                </div>
                <div>
                  <span className="font-mono bg-gray-700 px-1 rounded">1</span>-<span className="font-mono bg-gray-700 px-1 rounded">3</span> - Zoom levels
                </div>
              </div>
              {/* Arrow pointing to the button */}
              <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
            </div>
          )}
        </button>
      </div>

      {/* Submit Button - Positioned in visual center of sidebar vertically, or specific location? 
          GamePage uses top-20 left-[33%] (relative to full screen).
          Here we are INSIDE the sidebar (which is relative). 
          Let's place it nicely below the other controls or stick to bottom?
          Original GameControls used absolute positioning. 
          Let's put it at the bottom of the sidebar or fixed position?
          Actually, the user wants "UI controls... present in gamepage".
          In GamePage, the button is fairly high up.
          Let's put it below the icons.
      */}
      <div className="absolute top-64 w-full px-4 left-0">
        <button
          onClick={onSubmit}
          className={`w-full px-4 py-3 text-white font-bold rounded shadow-md transition-colors ${buttonColorClass}`}
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
};

export default GameControls;
