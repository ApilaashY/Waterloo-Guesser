import { useEffect } from 'react';

interface GameControlsProps {
  onSubmit: () => void;
  onNext: () => void;
  hasSubmitted: boolean;
  isLoading: boolean;
  score: number;
  round: number;
  maxRounds: number;
}

export default function GameControls({ 
  onSubmit, 
  onNext, 
  hasSubmitted, 
  isLoading, 
  score, 
  round, 
  maxRounds 
}: GameControlsProps) {
  // Submit on Enter or Space for keyboard accessibility
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // space or enter
      if (e.code === 'Space' || e.code === 'Enter') {
        // don't trigger while loading
        if (isLoading) return;
        e.preventDefault();
        if (hasSubmitted) onNext(); else onSubmit();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [hasSubmitted, isLoading, onNext, onSubmit]);

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
      {/* Home icon below both boxes */}
      <div className="absolute top-36 left-4 z-50">
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
