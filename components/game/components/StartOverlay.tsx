"use client";

import { useState, useEffect } from "react";

interface StartOverlayProps {
  onComplete: () => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

export default function StartOverlay({
  onComplete,
  onCancel,
  title = "READY?",
  subtitle = "You'll have 5 rounds to guess campus locations",
  description = "Click on the map where you think each photo was taken",
  buttonText = "START GAME",
}: StartOverlayProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Countdown complete, start game
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  const handleStart = () => {
    setIsStarting(true);
    setCountdown(3);
  };

  const handleCancel = () => {
    setCountdown(null);
    setIsStarting(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Handle Escape key to cancel countdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && countdown !== null) {
        handleCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [countdown]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative">
        {/* Countdown Display */}
        {countdown !== null && countdown > 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div
              className="text-[200px] font-bold text-white animate-pulse"
              style={{
                fontFamily: "Felgine, sans-serif",
                textShadow: "0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.4)",
                animation: "countdown-pulse 1s ease-in-out",
              }}
            >
              {countdown}
            </div>
            <button
              onClick={handleCancel}
              className="mt-8 px-6 py-2 text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              Press ESC to cancel
            </button>
          </div>
        ) : (
          /* Initial "Click to Start" Screen */
          <div className="flex flex-col items-center justify-center gap-8 p-12">
            <div className="text-center">
              <h2
                className="text-6xl font-bold text-white mb-4"
                style={{
                  fontFamily: "Felgine, sans-serif",
                  textShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
                }}
              >
                {title}
              </h2>
              <p className="text-xl text-white/80 mb-2">
                {subtitle}
              </p>
              <p className="text-lg text-white/60">
                {description}
              </p>
            </div>

            <button
              onClick={handleStart}
              className="group relative px-12 py-6 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-2xl rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
              style={{ fontFamily: "Felgine, sans-serif" }}
            >
              <span className="relative z-10">{buttonText}</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <div className="text-white/40 text-sm">
              Press{" "}
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                Space
              </kbd>{" "}
              to start
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes countdown-pulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
