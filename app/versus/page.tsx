"use client";

import React, { useRef, useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "../../components/SocketProvider";

// Types
import { GameState } from "./types";

// Hooks
import { useVersusSocket } from "./hooks/useVersusSocketHook";
import { useMapZoom } from "./hooks/useMapZoom";

// Components
import Toast from "./components/Toast";

import GameHeader from "./components/GameHeader";
import GameMap from "./components/GameMap";
import GameControls from "./components/GameControls";
import { LoadingState, ErrorState } from "./components/States";
import { CldImage } from "next-cloudinary";
import ResultsPopup from "./components/ResultsPopup";
import ImagePreview from "@/components/game/components/ImagePreview";
import StartOverlay from "@/components/game/components/StartOverlay";

function VersusPageContent() {
  // Search params and connection state
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("sessionId");
  const urlPartnerId = searchParams.get("partnerId");
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId);
  const [partnerId, setPartnerId] = useState<string | null>(urlPartnerId);
  const [isEnlarged, setIsEnlarged] = useState(false); // Track enlarged state
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
  const [imageIDs, setImageIDs] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [partnerPoints, setPartnerPoints] = useState(0);
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [round, setRound] = useState(0);

  // Round state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [opponentHasSubmitted, setOpponentHasSubmitted] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);

  // Coordinate state
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);

  // Start Overlay
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [isReady, setIsReady] = useState(false);

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



  const { emitPlayerReady } = useVersusSocket({
    socket,
    sessionId,
    partnerId,
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
      !partnerId || // Require partnerId for now to be safe, logic can handle it
      hasSubmitted ||
      xCoor === null ||
      yCoor === null
    ) {
      console.log("Cannot submit:", {
        hasSocket: !!socket,
        isConnected: socket?.connected,
        hasSessionId: !!sessionId,
        hasPartnerId: !!partnerId,
        hasSubmitted,
        hasCoordinates: xCoor !== null && yCoor !== null,
      });
      return;
    }

    console.log("Submitting coordinates:", {
      xCoor,
      yCoor,
      sessionId,
      partnerId,
    });
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
      console.log("[Versus] No image in state yet.");
      setNaturalSize(null);
      return;
    }

    console.log("[Versus] Loading image:", state.image);

    const img = new Image();
    img.onload = () => {
      console.log(
        "[Versus] Image loaded. Size:",
        img.naturalWidth,
        "x",
        img.naturalHeight
      );
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = (err) => {
      console.error("[Versus] Failed to load image:", err);
    };
    img.src = state.image;
  }, [state.image]);

  if (
    !socket?.connected ||
    !sessionId ||
    // Partner ID checking relaxed for formal mode as requested
    // (!partnerId && process.env.NODE_ENV !== 'production') || // Debug might still want it? user said "partner ID... needed for the debug version"
    hasSubmitted ||
    xCoor === null ||
    yCoor === null
  ) {
    // ... logging ...
  }

  // ============================================
  // DEBUG VERSION - Original Layout
  // ============================================
  /*
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gray-50">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-3rem)]">
        <GameHeader
          sessionId={sessionId}
          partnerId={partnerId}
          totalPoints={totalPoints}
          partnerPoints={partnerPoints}
          roundNumber={round + 1}
        />
  
        <Toast message={toast} />
  
        <GameMap
          image={state.image}
          xCoor={xCoor}
          yCoor={yCoor}
          setXCoor={isRoundComplete ? () => {} : setXCoor}
          setYCoor={isRoundComplete ? () => {} : setYCoor}
          xRightCoor={xRightCoor}
          yRightCoor={yRightCoor}
          showResult={showResult}
          isRoundComplete={isRoundComplete}
          onContinue={() => setShowResult(false)}
          mapContainerRef={mapContainerRef}
          disabled={isRoundComplete}
          currentScore={currentRoundScore}
        />
  
        <GameControls
          onSubmit={handleSubmit}
          opponentHasSubmitted={opponentHasSubmitted}
          isRoundComplete={isRoundComplete}
          hasSubmitted={hasSubmitted}
          xCoor={xCoor}
          yCoor={yCoor}
        />
  
        {state.image && (
          <ImagePreview
            imageSrc={state.image}
            naturalSize={naturalSize}
            enlarged={isEnlarged}
            setEnlarged={setIsEnlarged}
          />
        )}
  
        <ResultsPopup show={showPopup} setShow={setShowPopup} />
      </div>
    </div>
  );
  */

  // ============================================
  // FORMAL VERSION - New Layout
  // ============================================
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 flex-wrap gap-1">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Toast for notifications */}
        {toast && (
          <div className="absolute top-4 z-50 px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded shadow-lg">
            {toast}
            <button onClick={() => setToast(null)} className="ml-2 font-bold">
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-center w-full h-full">
          <style>
            {`
            .custom-grid {
              display: grid;
              grid-template-columns: 1fr 2fr;
            }
            
            .controls-sidebar {
              position: relative;
            }
            
            @media (max-width: 768px) {
              .custom-grid {
                grid-template-columns: 1fr;
              }
              
              .controls-sidebar {
                position: absolute;
                left: 0;
                top: 0;
                z-index: 10;
              }
            }
          `}
          </style>
          <div className="custom-grid w-full h-full mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">
            {/* Left side: Controls (1/3) */}
            <div className="controls-sidebar flex flex-col justify-start items-center h-fit p-4 pt-24">
              {/* GameControls handles all the sidebar UI now */}
              <div
                className={`w-full relative ${isMobile ? "flex flex-wrap" : ""
                  } items-center`}
              >
                <GameControls
                  onSubmit={handleSubmit}
                  opponentHasSubmitted={opponentHasSubmitted}
                  isRoundComplete={isRoundComplete}
                  hasSubmitted={hasSubmitted}
                  xCoor={xCoor}
                  yCoor={yCoor}
                  score={totalPoints}
                  partnerScore={partnerPoints}
                  round={round + 1}
                  maxRounds={5} // Assuming 5 rounds for versus as well
                  playerName={playerName}
                />

                {isRoundComplete && (
                  <div className="mt-8 w-full px-4 left-0">
                    <button
                      onClick={() => setShowResult(false)}
                      className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded shadow-md hover:bg-green-700 transition"
                    >
                      Start Next Round
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Map (2/3) */}
            <div className="flex justify-center items-center h-full relative z-0">
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
            </div>
          </div>
        </div>

        {/* Floating Image Preview */}
        {state.image && (
          <ImagePreview
            imageSrc={state.image}
            naturalSize={naturalSize}
            enlarged={isEnlarged}
            setEnlarged={setIsEnlarged}
          />
        )}

        <ResultsPopup show={showPopup} setShow={setShowPopup} />

        {/* Red Vignette Overlay (Heartbeat) */}
        {opponentHasSubmitted && !hasSubmitted && (
          <div className="fixed inset-0 animate-heartbeat z-40 pointer-events-none" />
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
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-white text-center">
              <div className="text-3xl font-bold animate-pulse mb-4">Waiting for opponent...</div>
              <p className="text-gray-300">The game will start when both players are ready.</p>
            </div>
          </div>
        )}
      </div>
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
