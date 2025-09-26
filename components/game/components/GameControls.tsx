import { useEffect, useState } from 'react';

interface GameControlsProps {
  onSubmit: () => void;
  onNext: () => void;
  hasSubmitted: boolean;
  isLoading: boolean;
  score: number;
  round: number;
  maxRounds: number;
  isModalOpen?: boolean; // Add this prop to indicate if any modal is open
}

export default function GameControls({ 
  onSubmit, 
  onNext, 
  hasSubmitted, 
  isLoading, 
  score, 
  round, 
  maxRounds,
  isModalOpen = false
}: GameControlsProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Submit on Enter or Space for keyboard accessibility
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // If a modal is open, don't handle any keyboard shortcuts
      if (isModalOpen) return;

      // Check if focus is on a form element - if so, don't interfere with typing
      const activeElement = document.activeElement;
      const isFormElement = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.getAttribute('contenteditable') === 'true'
      );
      if (isFormElement) return;

      // space or enter
      if (e.code === 'Space' || e.code === 'Enter') {
        if (isLoading) return;
        e.preventDefault();
        if (hasSubmitted) onNext(); else onSubmit();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [hasSubmitted, isLoading, onNext, onSubmit, isModalOpen]);

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <>
      {/* Points display at top left */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-6 py-2 text-lg font-bold text-gray-800">
          Points: {score}
        </div>
      </div>
      {/* Round display in its own box below points */}
      <div className="absolute top-20 left-4 z-50">
        <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-6 py-2 text-lg font-bold text-gray-800">
          Round: {round} / {maxRounds}
        </div>
      </div>
      {/* Home and Help icons side by side */}
      <div className="absolute top-36 left-4 z-50 flex flex-row gap-2">
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
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path d="M12 17h.01"/>
          </svg>
          {/* Shortcuts tooltip */}
          {showShortcuts && (
            <div className="absolute left-12 top-0 bg-gray-800 text-white text-sm rounded-lg p-3 whitespace-nowrap shadow-lg z-60 hidden md:block">
              <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
              <div className="space-y-1">
                <div><span className="font-mono bg-gray-700 px-1 rounded">Space</span> or <span className="font-mono bg-gray-700 px-1 rounded">Enter</span> - Submit/Next</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Mouse Wheel</span> - Zoom in/out</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Click + Drag</span> - Pan image</div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Click</span> - Place guess marker</div>
                <div>
                  <span className="font-mono bg-gray-700 px-1 rounded">W</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">A</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">S</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">D</span>
                  <span className="mx-1">or</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">↑</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">↓</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">←</span>
                  <span className="font-mono bg-gray-700 px-1 rounded">→</span>
                  <span className="ml-1">- Pan map</span>
                </div>
                <div><span className="font-mono bg-gray-700 px-1 rounded">Q</span>, <span className="font-mono bg-gray-700 px-1 rounded">E</span>, <span className="font-mono bg-gray-700 px-1 rounded">Z</span>, <span className="font-mono bg-gray-700 px-1 rounded">C</span> - Snap to corners</div>
                <div>
                  <span className="font-mono bg-gray-700 px-1 rounded">1</span> = 100% zoom,
                  <span className="font-mono bg-gray-700 px-1 rounded">2</span> = 300% zoom,
                  <span className="font-mono bg-gray-700 px-1 rounded">3</span> = 500% zoom
                </div>
                <div>
                  <span className="font-mono bg-gray-700 px-1 rounded">Shift</span> or <span className="font-mono bg-gray-700 px-1 rounded">Esc</span> - Reset map view
                </div>
              </div>
              {/* Arrow pointing to the button */}
              <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
            </div>
          )}
        </button>
      </div>
      <div className="absolute top-4 right-4 z-50">
        <button
          className={`px-4 py-2 text-white rounded shadow ${
            hasSubmitted 
              ? "bg-yellow-600 hover:bg-yellow-700" 
              : "bg-yellow-400 hover:bg-yellow-500    "
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={hasSubmitted ? onNext : onSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : hasSubmitted ? "Next" : "Submit"}
        </button>
      </div>
    </>
  );
}
