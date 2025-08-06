"use client";

import React, { useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "../../components/SocketProvider";

// Types
import { GameState } from "./types";

// Hooks
import { useVersusSocket } from "./hooks/useVersusSocketHook";
import { useGameActions } from "./hooks/useGameActions";
import { useMapZoom } from "./hooks/useMapZoom";

// Components
import Toast from "./components/Toast";

import GameHeader from "./components/GameHeader";
import GameMap from "./components/GameMap";
import DebugInfo from "./components/DebugInfo";
import GameControls from "./components/GameControls";
import { LoadingState, ErrorState } from "./components/States";
import { CldImage } from "next-cloudinary";

function VersusPageContent() {
  // Search params and connection state
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const urlPartnerId = searchParams.get('partnerId');
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId);
  const [partnerId, setPartnerId] = useState<string | null>(urlPartnerId);

  // Game state
  const [state, setState] = useState<GameState>({
    image: "",
    correctX: 0,
    correctY: 0,
  });
  
  // UI state
  const [toast, setToast] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Game data state
  const [imageIDs, setImageIDs] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [partnerPoints, setPartnerPoints] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  
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
  const { socket, isRestoringSession } = useSocket();

  // Custom hooks
  const { zoomToGuessAndAnswer } = useMapZoom(mapContainerRef, xCoor, yCoor, xRightCoor, yRightCoor);
  
  const { requestCurrentRound } = useVersusSocket({
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
    setShowResult,
  });

  const { handleSubmit, validateCoordinate } = useGameActions({
    socket,
    sessionId,
    partnerId,
    state,
    xCoor,
    yCoor,
    hasSubmitted,
    setHasSubmitted,
    setTotalPoints,
    setQuestionCount,
    setXRightCoor,
    setYRightCoor,
    zoomToGuessAndAnswer,
  });

  // Show loading state while restoring session
  if (isRestoringSession) {
    return <LoadingState message="Restoring your game session..." />;
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

  // Temporary debug: restart session handler
  const handleRestartSession = () => {
    if (socket && sessionId && partnerId) {
      socket.emit('restartSession', { sessionId, partnerId });
      setToast('Restarting session...');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gray-50">
      <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">

        {/* TEMP: Debug Restart Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleRestartSession}
            className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition-colors"
          >
            Restart Session (Debug)
          </button>
        </div>

        <GameHeader
          sessionId={sessionId}
          partnerId={partnerId}
          totalPoints={totalPoints}
          partnerPoints={partnerPoints}
          onRequestCurrentRound={requestCurrentRound}
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
        />

        <DebugInfo
          sessionId={sessionId}
          partnerId={partnerId}
          state={state}
          totalPoints={totalPoints}
          partnerPoints={partnerPoints}
          questionCount={questionCount}
          hasSubmitted={hasSubmitted}
          opponentHasSubmitted={opponentHasSubmitted}
          isRoundComplete={isRoundComplete}
          xCoor={xCoor}
          yCoor={yCoor}
          xRightCoor={xRightCoor}
          yRightCoor={yRightCoor}
        />

        <GameControls
          onValidateCoordinate={validateCoordinate}
          onSubmit={handleSubmit}
          opponentHasSubmitted={opponentHasSubmitted}
          isRoundComplete={isRoundComplete}
          hasSubmitted={hasSubmitted}
          xCoor={xCoor}
          yCoor={yCoor}
        />

        {/* Floating image display, styled like GamePage */}
        {state.image && (
          <div className="absolute bottom-4 left-4 flex justify-start items-start z-50">
            <CldImage
              src={state.image}
              width={400}
              height={300}
              crop={{ type: "auto", source: true }}
              alt="Campus location"
              className="rounded shadow scale-100 opacity-80 hover:opacity-100 hover:scale-125 origin-bottom-left transition-all duration-200"
              style={{ zIndex: 99999 }}
            />
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
