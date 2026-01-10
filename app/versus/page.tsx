"use client";

import { useRef, useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "../../components/SocketProvider";

// Types
import { GameState } from "./types";

// Hooks
import { useVersusSocket } from "./hooks/useVersusSocketHook";
import { useMapZoom } from "./hooks/useMapZoom";

// Components
import GameMap from "./components/GameMap";
import { LoadingState } from "./components/States";
import ResultsPopup from "./components/ResultsPopup";
import StartOverlay from "@/components/game/components/StartOverlay";
import ImagePreview from "@/components/game/components/ImagePreview";
import CountdownTimer from "./components/CountdownTimer";
import QueueLoadingTips from "@/components/QueueLoadingTips";
import { ArrowLeft, Home, Trophy, Shield, Check, Clock } from "lucide-react";

// Pressure Timer Component
function PressureTimer({
  startTime,
  duration = 15000,
}: {
  startTime: number | null;
  duration?: number;
}) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [percent, setPercent] = useState(100);

  useEffect(() => {
    if (!startTime) {
      setTimeLeft(null);
      setPercent(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newPercent = Math.max(0, (remaining / duration) * 100);

      setTimeLeft(Math.ceil(remaining / 1000));
      setPercent(newPercent);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  if (!startTime || timeLeft === null || timeLeft <= 0) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="animate-pulse bg-red-600/90 text-white px-6 py-2 rounded-full font-bold shadow-lg border-2 border-red-400 flex items-center gap-2">
        <Clock className="w-5 h-5 animate-spin-slow" />
        <span>Hurry! Bonus dropping: {timeLeft}s</span>
      </div>
      <div className="w-64 h-2 bg-black/50 rounded-full mt-2 overflow-hidden border border-white/20">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-100 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function VersusPageContent() {
  // Search params and connection state
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("sessionId");
  const urlPartnerId = searchParams.get("partnerId");
  const modifier = searchParams.get("modifier") || "normal";
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId);
  const [partnerId, setPartnerId] = useState<string | null>(urlPartnerId);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  // Game state
  const [state, setState] = useState<GameState>({
    image: "",
    correctX: 0,
    correctY: 0,
  });

  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Game data state
  const [totalPoints, setTotalPoints] = useState(0);
  const [partnerPoints, setPartnerPoints] = useState(0);
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [round, setRound] = useState(0);

  // Round state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [opponentHasSubmitted, setOpponentHasSubmitted] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  // Timed Mode State
  const [opponentSubmitTime, setOpponentSubmitTime] = useState<number | null>(null);

  // Rematch and disconnect state
  const [rematchStatus, setRematchStatus] = useState<{ player1Requested: boolean; player2Requested: boolean } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Coordinate state
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);

  // Start Overlay
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [partnerIsReady, setPartnerIsReady] = useState(false);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Socket connection
  const { socket } = useSocket();

  // Custom hooks
  const { zoomToGuessAndAnswer } = useMapZoom(
    mapContainerRef,
    xCoor,
    yCoor,
    xRightCoor,
    yRightCoor
  );

  const { emitPlayerReady, emitRematchRequest } = useVersusSocket({
    socket,
    sessionId,
    state,
    setToast,
    setState,
    setHasSubmitted,
    setOpponentHasSubmitted,
    setIsRoundComplete,
    setXCoor,
    setYCoor,
    setXRightCoor,
    setYRightCoor,
    setTotalPoints,
    setPartnerPoints,
    setCurrentRoundScore,
    setShowResult,
    setRound,
    setShowPopup,
    setRematchStatus,
    setCountdown,
    setPartnerIsReady,
    setOpponentSubmitTime,
    setOpponentLeft,
    setIsReady,
    setShowStartOverlay,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function handleSubmit() {
    if (
      !socket?.connected ||
      !sessionId ||
      !partnerId ||
      hasSubmitted ||
      xCoor === null ||
      yCoor === null
    ) {
      return;
    }

    setHasSubmitted(true);

    try {
      socket.emit("submitGuess", {
        x: xCoor,
        y: yCoor,
        sessionId,
      });
    } catch (error) {
      console.error("Error submitting coordinates:", error);
      setHasSubmitted(false);
    }
  }

  // Retrieve player name
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const storedName = sessionStorage.getItem("versus_player_name");
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Calculate natural size of image when it changes
  useEffect(() => {
    if (!state.image) {
      setNaturalSize(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = state.image;
  }, [state.image]);

  const handleHomeClick = () => {
    window.location.href = "/";
  };

  // Button state logic
  let submitLabel = "Submit Guess";
  let submitDisabled = false;
  let buttonColorClass = "bg-accent-primary hover:bg-accent-primary/80 shadow-accent-primary/20";

  if (isRoundComplete) {
    submitLabel = "Round Complete";
    submitDisabled = true;
    buttonColorClass = "bg-white/10 cursor-not-allowed text-secondary";
  } else if (hasSubmitted) {
    submitLabel = "Waiting for opponent...";
    submitDisabled = true;
    buttonColorClass = "bg-yellow-600/80 text-white/80 cursor-wait";
  } else if (xCoor === null || yCoor === null) {
    submitLabel = "Place your guess";
    submitDisabled = true;
    buttonColorClass = "bg-white/10 opacity-50 cursor-not-allowed";
  }

  // Who's winning indicator
  const isWinning = totalPoints > partnerPoints;
  const isTied = totalPoints === partnerPoints;

  return (
    <div className="fixed inset-0 flex flex-col bg-root text-primary selection:bg-accent-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent-soft/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      {/* Toast for notifications */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 bg-accent-primary/90 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Pressure Timer (only shows if opponent submitted first) */}
      {!hasSubmitted && !isRoundComplete && opponentSubmitTime && (
        <PressureTimer startTime={opponentSubmitTime} />
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="flex flex-row w-full h-full relative z-10">
          {/* Left Sidebar - Controls */}
          <div className="w-80 bg-surface/90 backdrop-blur-md border-r border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-black/40 border-b border-white/5 px-6 py-5">
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-xl font-heading font-bold flex items-center gap-2 text-glow">
                  <Shield className="w-5 h-5 text-accent-primary" />
                  VERSUS MODE
                </h1>
                <button
                  onClick={handleHomeClick}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors text-secondary hover:text-primary"
                  aria-label="Go to homepage"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-secondary text-xs font-data uppercase tracking-wider">
                  Round {round + 1} / 5
                </div>
                {modifier && modifier !== "normal" && (
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {modifier === "timed" ? "⏱️ TIMED" : modifier === "grayscale" ? "🎨 90s" : modifier.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Score Cards */}
            <div className="p-4 space-y-3">
              {/* Your Score */}
              <div className={`p-4 rounded-xl border transition-all ${isWinning ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isWinning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-accent-primary'}`}></div>
                    <span className="font-bold text-sm text-primary">{playerName || "You"}</span>
                  </div>
                  {isWinning && <Trophy className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-3xl font-bold text-primary font-heading tracking-tight">{totalPoints}</div>
                {isWinning && <div className="text-[10px] text-emerald-400 mt-1 font-bold uppercase tracking-wider">Leading</div>}
              </div>

              {/* Opponent Score */}
              <div className={`p-4 rounded-xl border transition-all ${!isWinning && !isTied ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${!isWinning && !isTied ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-secondary'}`}></div>
                    <span className="font-bold text-sm text-secondary">Opponent</span>
                  </div>
                </div>
                <span className="text-3xl font-bold text-secondary font-heading tracking-tight">{partnerPoints}</span>
                {!isWinning && !isTied && <div className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-wider">Leading</div>}
              </div>
            </div>

            {/* Status Indicators */}
            <div className="px-6 py-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary font-medium">Your status</span>
                <span className={`px-2 py-0.5 rounded textxs font-bold ${hasSubmitted ? 'bg-emerald-500/20 text-emerald-400' : 'text-yellow-500'}`}>
                  {hasSubmitted ? 'Submitted' : 'Guessing...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary font-medium">Opponent</span>
                <span className={`px-2 py-0.5 rounded textxs font-bold ${opponentHasSubmitted ? 'bg-emerald-500/20 text-emerald-400' : 'text-yellow-500'}`}>
                  {opponentHasSubmitted ? 'Submitted' : 'Guessing...'}
                </span>
              </div>
            </div>

            {/* Current Round Score (after submission) */}
            {isRoundComplete && currentRoundScore > 0 && (
              <div className="mx-4 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                <div className="relative text-center">
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1">Round Score</div>
                  <div className="text-2xl font-bold text-white">+{currentRoundScore}</div>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Submit Button */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <button
                onClick={handleSubmit}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 text-white ${buttonColorClass}`}
                disabled={submitDisabled}
              >
                {submitLabel}
              </button>

              {isRoundComplete && (
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full mt-3 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>

          {/* Main Map Area */}
          <div className="flex-1 relative bg-[#1a1a1a]">
            <GameMap
              image={state.image}
              xCoor={xCoor}
              yCoor={yCoor}
              setXCoor={isRoundComplete ? () => { } : setXCoor}
              setYCoor={isRoundComplete ? () => { } : setYCoor}
              xRightCoor={xRightCoor}
              yRightCoor={yRightCoor}
              showResult={showResult}
              isRoundComplete={isRoundComplete}
              onContinue={() => setShowResult(false)}
              mapContainerRef={mapContainerRef}
              disabled={isRoundComplete}
              currentScore={currentRoundScore}
            />

            {/* Image Preview Component */}
            {state.image && (
              <ImagePreview
                imageSrc={state.image}
                naturalSize={naturalSize}
                enlarged={isEnlarged}
                setEnlarged={setIsEnlarged}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col w-full h-full relative z-10">
          {/* Top Bar */}
          <div className="bg-surface/90 backdrop-blur-md border-b border-white/10 shadow-lg z-50 px-3 py-2">
            <div className="flex items-center justify-between">
              {/* Home Button */}
              <button
                onClick={handleHomeClick}
                className="flex items-center justify-center w-10 h-10 bg-white/5 rounded-lg border border-white/10 active:scale-95 transition-transform"
                aria-label="Go to homepage"
              >
                <Home className="w-5 h-5 text-secondary" />
              </button>

              {/* Score Display */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg border ${isWinning ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-[10px] text-secondary uppercase tracking-wider block leading-none mb-0.5">You</span>
                  <span className="font-bold text-primary">{totalPoints}</span>
                </div>
                <span className="text-secondary/50 font-bold text-xs">VS</span>
                <div className={`px-3 py-1.5 rounded-lg border ${!isWinning && !isTied ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                  <span className="text-[10px] text-secondary uppercase tracking-wider block leading-none mb-0.5">Opp</span>
                  <span className="font-bold text-primary">{partnerPoints}</span>
                </div>
              </div>

              {/* Round Display */}
              <div className="bg-accent-primary/20 border border-accent-primary/40 rounded-lg px-3 py-2">
                <span className="text-sm font-bold text-accent-primary">R{round + 1}/5</span>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
            <GameMap
              image={state.image}
              xCoor={xCoor}
              yCoor={yCoor}
              setXCoor={isRoundComplete ? () => { } : setXCoor}
              setYCoor={isRoundComplete ? () => { } : setYCoor}
              xRightCoor={xRightCoor}
              yRightCoor={yRightCoor}
              showResult={showResult}
              isRoundComplete={isRoundComplete}
              onContinue={() => setShowResult(false)}
              mapContainerRef={mapContainerRef}
              disabled={false}
              currentScore={currentRoundScore}
            />

            {/* Round Complete Banner - Mobile */}
            {isRoundComplete && isMobile && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-emerald-500/95 backdrop-blur-md rounded-xl px-6 py-3 shadow-2xl border-2 border-emerald-400 animate-in slide-in-from-top-4">
                <div className="text-center">
                  <div className="text-white font-bold text-lg mb-1">Round Complete!</div>
                  {currentRoundScore > 0 && (
                    <div className="text-emerald-100 text-sm font-semibold">+{currentRoundScore} points</div>
                  )}
                </div>
              </div>
            )}

            {/* Image Preview Component - Desktop & Tablet */}
            {state.image && !isMobile && (
              <ImagePreview
                imageSrc={state.image}
                naturalSize={naturalSize}
                enlarged={isEnlarged}
                setEnlarged={setIsEnlarged}
              />
            )}

            {/* Floating Image Preview - Mobile (smaller, tap to enlarge) */}
            {state.image && isMobile && (
              <div
                className="absolute top-3 left-3 z-30 bg-white rounded-lg shadow-2xl border-4 border-accent-primary overflow-hidden cursor-pointer active:scale-95 transition-transform"
                onClick={() => setIsEnlarged(true)}
              >
                <div className="bg-accent-primary text-white px-2 py-1 text-[10px] font-bold flex items-center justify-between">
                  <span>Photo</span>
                  <span className="opacity-70">Tap to zoom</span>
                </div>
                <img
                  src={state.image}
                  alt="Location"
                  className="w-28 h-20 object-cover"
                />
              </div>
            )}

            {/* Fullscreen Image Modal - Mobile */}
            {isEnlarged && state.image && isMobile && (
              <div
                className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
                onClick={() => setIsEnlarged(false)}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/50">
                  <span className="text-white font-bold">Location Photo</span>
                  <button
                    className="text-white bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                    onClick={() => setIsEnlarged(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={state.image}
                    alt="Location"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>

                {/* Info Footer */}
                <div className="px-4 py-4 bg-black/50 text-center">
                  <p className="text-white/60 text-sm">Tap outside to close</p>
                </div>
              </div>
            )}

            {/* Status Indicator Overlay */}
            {!isRoundComplete && (
              <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
                <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-sm shadow-sm ${hasSubmitted ? 'bg-emerald-500/90 border-emerald-500 text-white' : 'bg-surface/80 border-white/10 text-secondary'}`}>
                  {hasSubmitted ? '✓ You' : '○ You'}
                </div>
                <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-sm shadow-sm ${opponentHasSubmitted ? 'bg-emerald-500/90 border-emerald-500 text-white' : 'bg-surface/80 border-white/10 text-secondary'}`}>
                  {opponentHasSubmitted ? '✓ Opp' : '○ Opp'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar - Controls */}
          <div className="bg-surface/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-50 px-4 py-4 pb-8">
            {isRoundComplete ? (
              <div className="flex flex-col gap-3">
                {currentRoundScore > 0 && (
                  <div className="text-center py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold">+{currentRoundScore} PTS</span>
                  </div>
                )}
                <button
                  onClick={() => setShowResult(false)}
                  className="w-full py-3.5 bg-accent-primary text-white font-bold rounded-xl shadow-lg shadow-accent-primary/20"
                >
                  Continue →
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                className={`w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all text-white ${buttonColorClass}`}
                disabled={submitDisabled}
              >
                {submitLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Popup */}
      <ResultsPopup
        show={showPopup}
        setShow={setShowPopup}
        onRematch={emitRematchRequest}
        rematchStatus={rematchStatus}
        opponentLeft={opponentLeft}
      />

      {/* Red Vignette Overlay (Heartbeat) */}
      {opponentHasSubmitted && !hasSubmitted && !isRoundComplete && (
        <div className="fixed inset-0 animate-heartbeat z-40 pointer-events-none shadow-[inset_0_0_100px_rgba(255,0,0,0.2)]" />
      )}

      {/* Start Overlay */}
      {showStartOverlay && (
        <StartOverlay
          onComplete={() => {
            setShowStartOverlay(false);
            setIsReady(true);
            emitPlayerReady();
          }}
          title="VERSUS MODE"
          subtitle="Compete head-to-head!"
          description="Guess closer than your opponent to win."
          buttonText="I'M READY"
        />
      )}

      {/* Waiting for Opponent Overlay */}
      {!showStartOverlay && isReady && !state.image && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50 backdrop-blur-sm">
          <div className="text-white text-center px-6">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-accent-primary" />
              </div>
            </div>

            <div className="text-2xl font-bold mb-2">
              {partnerIsReady ? "Starting game..." : "Waiting for opponent..."}
            </div>
            <p className="text-secondary text-sm mb-6">
              {partnerIsReady
                ? "Your opponent is ready! Game starting soon..."
                : "The game will start when both players are ready."}
            </p>

            {/* Ready status indicators */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">You</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${partnerIsReady
                ? 'bg-emerald-500/20 border border-emerald-500/50'
                : 'bg-white/5 border border-white/10'}`}>
                {partnerIsReady
                  ? <Check className="w-4 h-4 text-emerald-400" />
                  : <div className="w-4 h-4 border-2 border-secondary/50 border-t-secondary rounded-full animate-spin" />
                }
                <span className={`text-sm ${partnerIsReady ? 'text-emerald-400' : 'text-secondary'}`}>Opponent</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-w-sm mx-auto">
              <QueueLoadingTips />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VersusPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VersusPageContent />
    </Suspense>
  );
}
