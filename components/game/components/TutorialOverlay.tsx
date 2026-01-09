"use client";

import { useState, useEffect } from "react";
import { FiX, FiArrowRight, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  highlightElement?: string; // CSS selector or position identifier
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right";
  action?: "click-map" | "click-submit" | "wait" | "none";
  requiredAction?: boolean; // If true, user must complete action to proceed
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  actionCompleted?: boolean; // External signal that required action was completed
  imagePreviewDimensions?: { width: number; height: number; left: number; bottom: number } | null; // Dynamic image preview dimensions
}

export default function TutorialOverlay({
  steps,
  onComplete,
  onSkip,
  currentStep,
  onStepChange,
  actionCompleted = false,
  imagePreviewDimensions = null,
}: TutorialOverlayProps) {
  const [canProceed, setCanProceed] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.requiredAction) {
      setCanProceed(actionCompleted);
    } else {
      setCanProceed(true);
    }
  }, [step, actionCompleted]);

  const handleNext = () => {
    if (!canProceed) return;

    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const getPositionClasses = () => {
    // Responsive positioning based on screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // For steps 4+ (submit and onwards), use top-left positioning to avoid photo interference
    // Points/rounds aren't looked at after step 3
    const useTopLeftPosition = !isMobile && currentStep >= 3 && step.position === "left";

    if (useTopLeftPosition) {
      return "top-8 left-8";
    }

    switch (step.position) {
      case "top-left":
        return "top-8 left-8";
      case "top-right":
        return "top-8 right-8";
      case "bottom-left":
        return "bottom-8 left-8";
      case "bottom-right":
        return "bottom-8 right-8";
      case "left":
        return isMobile ? "bottom-8 left-1/2 transform -translate-x-1/2" : "top-1/2 left-8 transform -translate-y-1/2";
      case "right":
        return isMobile ? "top-8 left-1/2 transform -translate-x-1/2" : "top-1/2 right-8 transform -translate-y-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
    }
  };

  const getHighlightStyle = () => {
    // Define highlight positions for specific UI elements based on actual GameControls layout
    // Note: Submit button moved to left edge of map (33.333%)
    const highlights: Record<string, { top?: string; left?: string; right?: string; width: string; height: string; bottom?: string }> = {
      "game-map": { top: "0", left: "33.333%", width: "66.667%", height: "100%" },
      "submit-button": { top: "5rem", left: "33.333%", width: "100px", height: "42px" },
      "score-display": { top: "1rem", left: "1rem", width: "180px", height: "42px" },
      "round-display": { top: "5rem", left: "1rem", width: "180px", height: "42px" },
    };

    // Use dynamic image preview dimensions if available
    if (step.highlightElement === "image-preview" && imagePreviewDimensions) {
      return {
        bottom: `${imagePreviewDimensions.bottom}px`,
        left: `${imagePreviewDimensions.left}px`,
        width: `${imagePreviewDimensions.width}px`,
        height: `${imagePreviewDimensions.height}px`,
      };
    }

    return highlights[step.highlightElement || ""] || null;
  };

  const highlightStyle = getHighlightStyle();

  // Convert CSS positioning to absolute SVG coordinates
  const getSvgCoordinates = () => {
    if (!highlightStyle) return null;

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Parse dimensions
    const parseValue = (value: string | undefined, relativeTo: number): number => {
      if (!value) return 0;
      if (value.includes('%')) {
        return (parseFloat(value) / 100) * relativeTo;
      }
      if (value.includes('rem')) {
        return parseFloat(value) * 16; // 1rem = 16px
      }
      if (value.includes('px')) {
        return parseFloat(value);
      }
      return parseFloat(value) || 0;
    };

    const width = parseValue(highlightStyle.width, viewportWidth);
    const height = parseValue(highlightStyle.height, viewportHeight);

    let x = 0;
    let y = 0;

    // Calculate x position
    if (highlightStyle.left !== undefined) {
      x = parseValue(highlightStyle.left, viewportWidth);
    } else if (highlightStyle.right !== undefined) {
      const rightOffset = parseValue(highlightStyle.right, viewportWidth);
      x = viewportWidth - rightOffset - width;
    }

    // Calculate y position
    if (highlightStyle.top !== undefined && highlightStyle.top !== 'auto') {
      y = parseValue(highlightStyle.top, viewportHeight);
    } else if (highlightStyle.bottom !== undefined) {
      const bottomOffset = parseValue(highlightStyle.bottom, viewportHeight);
      y = viewportHeight - bottomOffset - height;
    }

    return { x, y, width, height };
  };

  const svgCoords = getSvgCoordinates();

  return (
    <>
      {/* Dark overlay with spotlight effect - using SVG mask for true transparency */}
      {highlightStyle && svgCoords ? (
        <>
          {/* Dark overlay with hole cut out */}
          <svg className="fixed inset-0 z-[250] pointer-events-none" style={{ width: '100%', height: '100%' }}>
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={svgCoords.x}
                  y={svgCoords.y}
                  width={svgCoords.width}
                  height={svgCoords.height}
                  fill="black"
                  rx="8"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.7)" mask="url(#spotlight-mask)" />
          </svg>

          {/* Highlight border (non-blocking) */}
          <div
            className="fixed border-4 border-blue-400 rounded-lg animate-pulse-slow pointer-events-none z-[250]"
            style={{
              top: highlightStyle.top,
              left: highlightStyle.left,
              right: highlightStyle.right,
              width: highlightStyle.width,
              height: highlightStyle.height,
              bottom: highlightStyle.bottom,
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] pointer-events-auto" />
      )}

      {/* Tutorial card */}
      <div className={`fixed z-[260] ${getPositionClasses()} max-w-md pointer-events-auto`}>
        <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-blue-300/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-white font-bold text-lg">{step.title}</h3>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors"
              title="Skip tutorial"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Action indicator */}
            {step.requiredAction && !actionCompleted && (
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800 font-medium">
                  ⚡ Action required: {step.action === "click-map" && "Click on the map"}
                  {step.action === "click-submit" && "Click the Submit button"}
                  {step.action === "wait" && "Wait for the next step"}
                </p>
              </div>
            )}

            {step.requiredAction && actionCompleted && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded flex items-center gap-2">
                <FiCheckCircle className="text-green-600" size={20} />
                <p className="text-sm text-green-800 font-medium">Action completed!</p>
              </div>
            )}

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Tutorial Progress</span>
                <span>
                  {currentStep + 1} of {steps.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isFirstStep
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                <FiArrowLeft size={18} />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${canProceed
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {isLastStep ? "Finish Tutorial" : "Next"}
                <FiArrowRight size={18} />
              </button>
            </div>

            {/* Skip option */}
            <button
              onClick={onSkip}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial (you can review controls in the Help menu)
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            border-color: rgba(96, 165, 250, 0.8);
          }
          50% {
            border-color: rgba(59, 130, 246, 1);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
