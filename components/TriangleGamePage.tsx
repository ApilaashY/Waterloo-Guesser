"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GameHeader,
  GameControls,
  TriangleGameControls,
  GameMap,
  ImagePreview,
  TriangleImagePreview,
  useGameState,
  useImageState,
  useMapControls,
  usePerformanceTracking,
  GameMode,
  MatchService,
  GameService,
} from "./game";
import GameStats from "./game/components/GameStats";
import SingleGuessControls from "./game/components/SingleGuessControls";
import SaveScoreModal from "./game/components/SaveScoreModal";
import StartOverlay from "./game/components/StartOverlay";
import { useSession } from "./SessionProvider";
import { Toaster, toast } from "react-hot-toast";

// Utility to detect mobile devices
function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

interface TriangleGamePageProps {
  modifier?: string;
}

export default function TriangleGamePage({ modifier }: TriangleGamePageProps) {
  // Use modular hooks - same as GamePage
  const {
    gameState,
    startGame,
    resetGame,
    updateGameState,
    nextRound,
  } = useGameState();
  const { user } = useSession();
  const { imageState, loadNewImage, resetImageState } = useImageState();
  const { mapRef, controls: mapControls } = useMapControls();
  const { recordImageLoaded, recordFirstMapClick, recordFirstSubmit } = usePerformanceTracking();
  const router = useRouter();

  // Triangle-specific state
  const [triangleImages, setTriangleImages] = useState<any[]>([]);
  const [triangleData, setTriangleData] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Toggles and Modes
  const [guessMode, setGuessMode] = useState<'triangle' | 'single'>('triangle');
  const [singleGuess, setSingleGuess] = useState<{ x: number, y: number } | null>(null);

  // User Interaction State
  const [userVertices, setUserVertices] = useState<({ x: number, y: number } | null)[]>([null, null, null]);
  const [activeVertexIndex, setActiveVertexIndex] = useState(0);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Start Overlay State
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [gameReady, setGameReady] = useState(false);

  // Daily Session Logic
  const getDailySessionId = (): string => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `dailySessionId_${today}`;
    if (typeof window === 'undefined' || !window.localStorage) {
      return `${today}_${Math.random().toString(36).substring(2)}`;
    }
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = `${today}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  };

  // State for Map (Legacy xCoor/yCoor used for centering mostly, but actual data is in userVertices)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showSaveScoreModal, setShowSaveScoreModal] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Timing
  const [imageLoadedAt, setImageLoadedAt] = useState<number | null>(null);
  const [guessSubmittedAt, setGuessSubmittedAt] = useState<number | null>(null);
  const [lastRoundScore, setLastRoundScore] = useState<number | null>(null);

  // Load Images
  const loadTriangleImages = async () => {
    try {
      const response = await fetch("/api/getPhoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "triangle", previousCodes: [] })
      });
      if (!response.ok) throw new Error("Failed to load triangle images");
      const data = await response.json();
      setTriangleImages(data.images);
      setTriangleData(data.triangleData);
      setCurrentImageIndex(0);
      setUserVertices([null, null, null]);
      setSingleGuess(null);
      setActiveVertexIndex(0);
      setGuessMode('triangle'); // Default to triangle? Or preserve? Preserving might be better but let's reset for now.
    } catch (error) {
      console.error("Error loading triangle images:", error);
      toast.error("Failed to load triangle images");
    }
  };

  useEffect(() => {
    if (!gameState.isStarted && gameReady) {
      startGame(GameMode.SinglePlayer);
      loadTriangleImages();
    }
  }, [gameState.isStarted, gameReady, startGame]);

  const handleStartOverlayComplete = () => {
    setShowStartOverlay(false);
    setGameReady(true);
  };

  // Load natural size logic
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);
    setImageLoadedAt(null);
    if (triangleImages.length === 0 || !triangleImages[currentImageIndex]) return;

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageLoadedAt(Date.now());
      recordImageLoaded();
    };
    img.src = triangleImages[currentImageIndex].image;
    return () => { mounted = false; };
  }, [triangleImages, currentImageIndex, recordImageLoaded]);

  // Handle Vertex Selection & Linked Photo
  const handleVertexSelect = (index: number) => {
    setActiveVertexIndex(index);
    setCurrentImageIndex(index);
  };

  // Handle User Clicking Map
  const handleCoordinateClick = (x: number | null, y: number | null) => {
    if (gameState.isSubmitted) return;
    recordFirstMapClick();
    if (x !== null && y !== null) {
      if (guessMode === 'single') {
        setSingleGuess({ x, y });
      } else {
        const newVertices = [...userVertices];
        newVertices[activeVertexIndex] = { x, y };
        setUserVertices(newVertices);
      }
    }
  };

  const handleSubmit = async () => {
    let score = 0;
    let distance = 0;

    setGuessSubmittedAt(Date.now());
    recordFirstSubmit();
    const centroid = triangleData.centroid;

    if (guessMode === 'single') {
      if (!singleGuess) {
        toast.error("Please place a guess marker!");
        return;
      }
      // Score based on distance to centroid
      distance = Math.sqrt(Math.pow(singleGuess.x - centroid.x, 2) + Math.pow(singleGuess.y - centroid.y, 2));
      const maxDistance = 0.3; // Stricter? Or same?
      score = Math.max(0, Math.round(5000 * (1 - distance / maxDistance)));

    } else {
      // Triangle Mode
      if (userVertices.some(v => v === null)) {
        toast.error("Please place all 3 vertices before submitting!");
        return;
      }

      // Sum of distances
      let totalDistance = 0;
      const correctVertices = triangleData.vertices;

      userVertices.forEach((uv, idx) => {
        if (uv && correctVertices[idx]) {
          const dist = Math.sqrt(Math.pow(uv.x - correctVertices[idx].x, 2) + Math.pow(uv.y - correctVertices[idx].y, 2));
          totalDistance += dist;
        }
      });

      distance = totalDistance / 3;
      const maxDistance = 0.5;
      score = Math.max(0, Math.round(5000 * (1 - distance / maxDistance)));
    }

    const roundResult = {
      round: gameState.currentRound,
      userCoordinates: null,
      correctCoordinates: { x: centroid.x, y: centroid.y },
      points: score,
      distance: distance,
    };

    updateGameState({
      isSubmitted: true,
      score: gameState.score + score,
      roundResults: [...gameState.roundResults, roundResult]
    });

    setLastRoundScore(score);
    toast.success(`You scored ${score} points!`);
  };

  const handleNext = async () => {
    if (gameState.currentRound >= gameState.maxRounds) {
      setShowSaveScoreModal(true);
    } else {
      loadTriangleImages();
      // Reset internal state
      setUserVertices([null, null, null]);
      setSingleGuess(null);
      setLastRoundScore(null);
      setActiveVertexIndex(0);
      nextRound();
      if (mapRef.current) mapControls.resetZoom();
    }
  };

  const handleSaveScore = async () => {
    setIsSavingScore(true);
    try {
      const result = await GameService.saveToDailyLeaderboard(
        undefined, // Undefined triggers random username generation
        gameState.score,
        gameState.currentRound,
        getDailySessionId()
      );

      if (result.success) {
        toast.success(`Score saved! You are confirmed as ${result.username}`);
        setTimeout(() => {
          router.push('/leaderboard');
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save score:", error);
      toast.error("Failed to save score");
      throw error; // Propagate to modal
    } finally {
      setIsSavingScore(false);
    }
  };

  // Skip strict "GameControls" props and use our custom one
  const hasSubmitted = gameState.isSubmitted;

  // -- Render --
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 flex-wrap gap-1">
      <Toaster position="top-center" containerStyle={{ top: 24 }} />
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="flex items-center justify-center w-full h-full">
          <div className="flex flex-row items-center justify-between w-full h-full mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">

            {/* Left Side: Composed Controls using Strategy Pattern */}
            <div className="flex flex-col gap-4 w-1/3 h-full bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
              {/* 1. Common Stats */}
              <GameStats
                score={gameState.score}
                round={gameState.currentRound}
                maxRounds={gameState.maxRounds}
                onHomeClick={() => window.location.href = '/'}
              />

              {/* 2. Mode Strategy Selection */}
              <div className="flex p-1 bg-gray-200 rounded-lg self-center w-full max-w-sm shrink-0">
                <button
                  onClick={() => setGuessMode('triangle')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition ${guessMode === 'triangle' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Triangulate
                </button>
                <button
                  onClick={() => setGuessMode('single')}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition ${guessMode === 'single' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Quick Guess
                </button>
              </div>

              {/* 3. Active Strategy Controls */}
              <div className="flex-1 flex flex-col justify-start items-center gap-6 w-full text-center">
                {guessMode === 'triangle' ? (
                  <TriangleGameControls
                    totalImages={triangleImages.length}
                    currentImageIndex={currentImageIndex}
                    onImageChange={setCurrentImageIndex}
                    activeVertexIndex={activeVertexIndex}
                    onVertexSelect={handleVertexSelect}
                    userVertices={userVertices}
                    onSubmit={handleSubmit}
                    onNext={handleNext}
                    hasSubmitted={hasSubmitted}
                    isLoading={gameState.isLoading}
                  />
                ) : (
                  <div className="flex-1 flex flex-col justify-start items-center gap-6 w-full text-center">
                    <SingleGuessControls
                      activeVertexIndex={activeVertexIndex}
                      onVertexSelect={handleVertexSelect}
                      currentImageIndex={currentImageIndex}
                      hasSubmitted={hasSubmitted}
                    />
                    <button
                      className={`
                            w-full py-4 rounded-xl font-bold text-xl shadow-lg transition transform hover:-translate-y-0.5
                            ${hasSubmitted ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}
                            ${gameState.isLoading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      onClick={hasSubmitted ? handleNext : handleSubmit}
                      disabled={gameState.isLoading}
                    >
                      {gameState.isLoading ? "Processing..." : hasSubmitted ? "Next Round ➔" : "Submit Guess"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Map */}
            <div className="flex justify-center items-center h-full w-2/3 max-md:fixed max-md:w-screen max-md:h-screen">
              <GameMap
                ref={mapRef}
                // Single Guess visualization via legacy props
                xCoor={guessMode === 'single' ? (singleGuess?.x ?? null) : null}
                yCoor={guessMode === 'single' ? (singleGuess?.y ?? null) : null}
                // Use triangle data for answer visualization if submitted
                xRightCoor={hasSubmitted ? triangleData?.centroid?.x : null}
                yRightCoor={hasSubmitted ? triangleData?.centroid?.y : null}

                onCoordinateClick={handleCoordinateClick}
                disableClickOnly={hasSubmitted}
                enlarged={isEnlarged}
                currentScore={lastRoundScore ?? 0}
                overrideZoom={zoom}
                setOverrideZoom={setZoom}
                overridePan={pan}
                setOverridePan={setPan}
                // Triangle Mode visualization
                userVertices={guessMode === 'triangle' ? userVertices : undefined}
                triangleData={(hasSubmitted || isDebugMode) ? triangleData : null}
              />

              {/* Debug Toggle
              <div className="absolute top-2 right-2 z-50">
                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className="text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-50 hover:opacity-100"
                >
                  {isDebugMode ? "Hide Answer" : "Debug: Show Answer"}
                </button>
              </div> */}
            </div>

          </div>
        </div>

        {/* Floating Image Preview - Buttons removed via props/style or new component logic? 
            Actually, the prompt asked to "move the button for changeing between vertices".
            We did that in TriangleGameControls. 
            Now we need to update TriangleImagePreview to NOT show them. 
            (We will do that by editing TriangleImagePreview.tsx in next step, 
            or assume it's fine for now and just renders image). 
        */}
        {triangleImages.length > 0 && triangleImages[currentImageIndex] && (
          <TriangleImagePreview
            triangleImages={triangleImages}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            naturalSize={naturalSize}
            enlarged={isEnlarged}
            setEnlarged={setIsEnlarged}
            modifier={modifier}
          />
        )}

        {/* Helper Instructions Overlay? */}
        {!hasSubmitted && !userVertices.some(v => v !== null) && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none z-40 text-sm">
            Click map to place <strong>Vertex {activeVertexIndex + 1}</strong>
          </div>
        )}

        {/* Save Score Modal */}
        <SaveScoreModal
          isOpen={showSaveScoreModal}
          score={gameState.score}
          rounds={gameState.currentRound}
          onSave={handleSaveScore}
          onSkip={() => { window.location.reload(); }} // Simple reload for now
          onClose={() => { window.location.reload(); }}
          onSignUp={() => router.push('/register')}
          isLoading={isSavingScore}
        />

        {/* Start Overlay */}
        {showStartOverlay && (
          <StartOverlay
            onComplete={handleStartOverlayComplete}
            title="TRIANGLE TROUBLE"
            subtitle="Can you triangulate the location?"
            description="Select 3 points to trap the target!"
            buttonText="LET'S GO!"
          />
        )}
      </div>
    </div>
  );
}
