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

  useVersusSocket({
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

  function handleSubmit() {
    if (
      !socket?.connected ||
      !sessionId ||
      !partnerId ||
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

  // Ensure we have a valid session ID before rendering the game
  if (!sessionId) {
    return (
      <ErrorState
        title="Session Error"
        message="No valid game session found. Please start a new game."
      />
    );
  }

  // Tell the server that the user has joined the game session
  useEffect(() => {
    if (socket) {
      console.log("SENT JOINED GAME");
      socket.emit("joinedGame", { sessionId, socketId: socket.id });
    }
  }, []);

  // Load natural size when image changes
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);

    if (!state.image) return;

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (!mounted) return;
      setNaturalSize(null);
    };
    img.src = state.image;

    return () => {
      mounted = false;
    };
  }, [state.image]);

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

        {/* Floating image display, styled like GamePage */}
        {state.image && (
          <ImagePreview
            imageSrc={state.image}
            naturalSize={naturalSize}
            enlarged={isEnlarged} // Pass enlarged state to ImagePreview
            setEnlarged={setIsEnlarged} // Allow ImagePreview to update enlarged state
          />
        )}

        <ResultsPopup show={showPopup} setShow={setShowPopup} />
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
