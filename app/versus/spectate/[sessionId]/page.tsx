"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/components/SocketProvider";

interface SpectatorGameState {
  sessionId: string;
  currentRound: number;
  maxRounds: number;
  player1Points: number;
  player2Points: number;
  player1Guess: { x: number; y: number } | null;
  player2Guess: { x: number; y: number } | null;
  answer: { x: number; y: number };
  imageUrl: string;
  spectatorCount: number;
  player1Status: string;
  player2Status: string;
  isRoundComplete: boolean;
}

function SpectatorPageContent() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<SpectatorGameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("spectateMatch", { sessionId });

    socket.on("spectateMatchResult", (result: {
      success: boolean;
      gameState?: SpectatorGameState;
      error?: string;
    }) => {
      if (result.success && result.gameState) {
        setGameState(result.gameState);
        setError(null);
      } else {
        setError(result.error || "Failed to join match");
      }
    });

    socket.on("spectatorUpdate", (newState: SpectatorGameState) => {
      setGameState(newState);
    });

    socket.on("spectatorRoundOver", (newState: SpectatorGameState) => {
      setGameState(newState);
    });

    socket.on("spectatorRoundStart", (newState: SpectatorGameState) => {
      setGameState(newState);
    });

    return () => {
      socket.emit("stopSpectating", { sessionId });
      socket.off("spectateMatchResult");
      socket.off("spectatorUpdate");
      socket.off("spectatorRoundOver");
      socket.off("spectatorRoundStart");
    };
  }, [socket, sessionId]);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Connecting to match...</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string, hasSubmitted: boolean) => {
    if (hasSubmitted) return "✓ Submitted";
    if (status === "ready") return "Ready";
    if (status === "active") return "Active";
    return "Waiting";
  };

  const getStatusColor = (status: string, hasSubmitted: boolean) => {
    if (hasSubmitted) return "text-green-600";
    if (status === "ready") return "text-blue-600";
    if (status === "active") return "text-yellow-600";
    return "text-gray-400";
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-200 shadow-md z-50">
        <div className="flex items-center justify-between px-3 py-2 md:px-6 md:py-3">
          {/* Home Button */}
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition shadow-sm"
            aria-label="Go to homepage"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700"
            >
              <path d="M3 9.5L12 3l9 6.5" />
              <path d="M4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10" />
            </svg>
          </Link>

          {/* Player Widgets */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 justify-center mx-3">
            {/* Player 1 Widget */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-2 py-1 md:px-4 md:py-2 shadow-sm min-w-[80px] md:min-w-[120px]">
              <div className="flex items-center justify-between gap-1 md:gap-2">
                <div className="flex flex-col">
                  <span className="text-blue-700 font-bold text-xs md:text-sm">P1</span>
                  <span className={`text-[10px] md:text-xs font-medium ${getStatusColor(gameState.player1Status, gameState.player1Guess !== null)}`}>
                    {getStatusDisplay(gameState.player1Status, gameState.player1Guess !== null)}
                  </span>
                </div>
                <span className="text-lg md:text-2xl font-bold text-blue-600">{gameState.player1Points}</span>
              </div>
            </div>

            {/* Player 2 Widget */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg px-2 py-1 md:px-4 md:py-2 shadow-sm min-w-[80px] md:min-w-[120px]">
              <div className="flex items-center justify-between gap-1 md:gap-2">
                <div className="flex flex-col">
                  <span className="text-red-700 font-bold text-xs md:text-sm">P2</span>
                  <span className={`text-[10px] md:text-xs font-medium ${getStatusColor(gameState.player2Status, gameState.player2Guess !== null)}`}>
                    {getStatusDisplay(gameState.player2Status, gameState.player2Guess !== null)}
                  </span>
                </div>
                <span className="text-lg md:text-2xl font-bold text-red-600">{gameState.player2Points}</span>
              </div>
            </div>
          </div>

          {/* Round Info (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm font-bold text-gray-700">
                Round {gameState.currentRound}/{gameState.maxRounds}
              </span>
            </div>

            {/* Exit Button */}
            <Link
              href="/"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold shadow-sm"
            >
              Exit
            </Link>
          </div>

          {/* Exit Button (Mobile) */}
          <Link
            href="/"
            className="md:hidden px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm shadow-sm"
          >
            Exit
          </Link>
        </div>
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 relative overflow-hidden">
        {/* Image Preview - Top Left */}
        {gameState.imageUrl && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-30 bg-white rounded-lg shadow-2xl border-4 border-blue-500 overflow-hidden">
            <div className="bg-blue-500 text-white px-2 py-1 text-[10px] md:text-xs font-bold">
              LOCATION TO FIND
            </div>
            <img
              src={gameState.imageUrl}
              alt="Location to find"
              className="w-32 h-24 md:w-48 md:h-36 object-cover"
            />
          </div>
        )}

        {/* Map Container with proper aspect ratio */}
        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
          <div className="relative w-full h-full max-w-[896px] max-h-[683px]" ref={mapContainerRef}>
            <div className="relative w-full h-full">
              <img
                src="/uw campus map.png"
                alt="Campus Map"
                className="w-full h-full object-contain"
                style={{
                  imageRendering: 'auto'
                }}
              />

              {/* Player 1 Marker (Blue) */}
              {gameState.player1Guess && (
                <div
                  className="absolute w-5 h-5 md:w-6 md:h-6 -ml-2.5 -mt-2.5 md:-ml-3 md:-mt-3 rounded-full bg-blue-500 border-3 md:border-4 border-white shadow-lg z-10 flex items-center justify-center"
                  style={{
                    left: `${gameState.player1Guess.x * 100}%`,
                    top: `${gameState.player1Guess.y * 100}%`,
                  }}
                >
                  <span className="text-white text-[10px] md:text-xs font-bold">1</span>
                </div>
              )}

              {/* Player 2 Marker (Red) */}
              {gameState.player2Guess && (
                <div
                  className="absolute w-5 h-5 md:w-6 md:h-6 -ml-2.5 -mt-2.5 md:-ml-3 md:-mt-3 rounded-full bg-red-500 border-3 md:border-4 border-white shadow-lg z-10 flex items-center justify-center"
                  style={{
                    left: `${gameState.player2Guess.x * 100}%`,
                    top: `${gameState.player2Guess.y * 100}%`,
                  }}
                >
                  <span className="text-white text-[10px] md:text-xs font-bold">2</span>
                </div>
              )}

              {/* Answer Marker (Green) */}
              {gameState.isRoundComplete && (
                <div
                  className="absolute w-6 h-6 md:w-8 md:h-8 -ml-3 -mt-3 md:-ml-4 md:-mt-4 rounded-full bg-green-500 border-3 md:border-4 border-white shadow-lg z-20 flex items-center justify-center"
                  style={{
                    left: `${gameState.answer.x * 100}%`,
                    top: `${gameState.answer.y * 100}%`,
                  }}
                >
                  <span className="text-white text-xs md:text-sm font-bold">✓</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Round Status Overlay (when round complete) */}
        {gameState.isRoundComplete && (
          <div className="absolute bottom-16 md:bottom-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="bg-green-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-2xl border-4 border-green-600">
              <p className="font-bold text-sm md:text-base text-center">
                Round Complete!
              </p>
              <p className="text-xs md:text-sm text-center mt-1 opacity-90">
                Next round starting soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar - Round Info (Mobile Only) */}
      {isMobile && (
        <div className="bg-white border-t-2 border-gray-200 shadow-md px-4 py-3 z-50">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm font-bold text-gray-700">
                Round {gameState.currentRound}/{gameState.maxRounds}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {gameState.spectatorCount} watching
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpectatorPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center">Loading...</div>}>
      <SpectatorPageContent />
    </Suspense>
  );
}
