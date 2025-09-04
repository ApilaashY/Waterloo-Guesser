import { useEffect } from 'react';

interface GameControlsProps {
  onSubmit: () => void;
  onNext: () => void;
  hasSubmitted: boolean;
  isLoading: boolean;
}

export default function GameControls({ 
  onSubmit, 
  onNext, 
  hasSubmitted, 
  isLoading 
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
  return (
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
  );
}
