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
  RoundResult,
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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      setGuessMode('triangle');
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
    let multiplier = 1;

    setGuessSubmittedAt(Date.now());
    recordFirstSubmit();
    const centroid = triangleData.centroid;

    if (guessMode === 'single') {
      // Quick Guess Mode: Only 1x multiplier (just guessing the midpoint)
      if (!singleGuess) {
        toast.error("Please place a guess marker!");
        return;
      }
      multiplier = 1;
      distance = Math.sqrt(Math.pow(singleGuess.x - centroid.x, 2) + Math.pow(singleGuess.y - centroid.y, 2));
      const maxDistance = 0.3;
      const baseScore = Math.max(0, Math.round(1250 * (1 - distance / maxDistance))); // Max 1250 points
      score = baseScore * multiplier;

    } else {
      // Triangle Mode: 4x multiplier (placing all 3 vertices)
      if (userVertices.some(v => v === null)) {
        toast.error("Please place all 3 vertices before submitting!");
        return;
      }

      multiplier = 4;
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
      const baseScore = Math.max(0, Math.round(1250 * (1 - distance / maxDistance))); // Max 1250 base
      score = baseScore * multiplier; // Max 5000 points with 4x multiplier
    }

    const roundResult: RoundResult = {
      round: gameState.currentRound,
      userCoordinates: { x: centroid.x, y: centroid.y },
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
    const modeLabel = guessMode === 'triangle' ? '(4x Triangle Bonus!)' : '(1x Quick Guess)';
    toast.success(`You scored ${score} points! ${modeLabel}`);
  };

  const handleNext = async () => {
    if (gameState.currentRound >= gameState.maxRounds) {
      setShowSaveScoreModal(true);
    } else {
      loadTriangleImages();
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
        undefined,
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
      throw error;
    } finally {
      setIsSavingScore(false);
    }
  };

  const hasSubmitted = gameState.isSubmitted;

  const handleHomeClick = () => {
    window.location.href = "/";
  };

  // -- Render --
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      <Toaster position="top-center" containerStyle={{ top: 24 }} />

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="relative flex flex-row w-full h-full">
          {/* Left Side: Controls */}
          <div className="flex flex-col gap-4 w-1/3 h-full bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Stats */}
            <GameStats
              score={gameState.score}
              round={gameState.currentRound}
              maxRounds={gameState.maxRounds}
              onHomeClick={handleHomeClick}
            />

            {/* Mode Toggle with Multiplier */}
            <div className="flex p-1 bg-gray-200 rounded-lg self-center w-full max-w-sm shrink-0">
              <button
                onClick={() => setGuessMode('triangle')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition flex flex-col items-center ${guessMode === 'triangle' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <span>Triangulate</span>
                <span className={`text-xs ${guessMode === 'triangle' ? 'text-green-600' : 'text-gray-400'}`}>4x Points</span>
              </button>
              <button
                onClick={() => setGuessMode('single')}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition flex flex-col items-center ${guessMode === 'single' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <span>Quick Guess</span>
                <span className={`text-xs ${guessMode === 'single' ? 'text-yellow-600' : 'text-gray-400'}`}>1x Points</span>
              </button>
            </div>

            {/* Controls */}
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
          <div className="flex justify-center items-center h-full w-2/3">
            <GameMap
              ref={mapRef}
              xCoor={guessMode === 'single' ? (singleGuess?.x ?? null) : null}
              yCoor={guessMode === 'single' ? (singleGuess?.y ?? null) : null}
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
              userVertices={guessMode === 'triangle' ? userVertices : undefined}
              triangleData={(hasSubmitted || isDebugMode) ? triangleData : null}
            />
          </div>

          {/* Floating Image Preview - Desktop */}
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
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col w-full h-full relative">
          {/* Top Bar - Stats and Home */}
          <div className="bg-white border-b-2 border-gray-200 shadow-sm z-50 px-3 py-2">
            <div className="flex items-center justify-between">
              {/* Home Button */}
              <button
                onClick={handleHomeClick}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition shadow-sm"
                aria-label="Go to homepage"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M3 9.5L12 3l9 6.5" />
                  <path d="M4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10" />
                </svg>
              </button>

              {/* Stats */}
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-1 shadow-sm">
                  <span className="text-sm font-bold text-gray-700">{gameState.score} pts</span>
                </div>
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-1 shadow-sm">
                  <span className="text-sm font-bold text-gray-700">
                    {gameState.currentRound}/{gameState.maxRounds}
                  </span>
                </div>
              </div>

              {/* Mode Toggle (Compact with multiplier) */}
              <div className="flex p-0.5 bg-gray-200 rounded-lg">
                <button
                  onClick={() => setGuessMode('triangle')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${guessMode === 'triangle' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  <span>4x</span>
                </button>
                <button
                  onClick={() => setGuessMode('single')}
                  className={`px-2 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${guessMode === 'single' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                >
                  <span>1x</span>
                </button>
              </div>
            </div>
          </div>

          {/* Map Area - Full screen minus top and bottom bars */}
          <div className="flex-1 relative overflow-hidden">
            <GameMap
              ref={mapRef}
              xCoor={guessMode === 'single' ? (singleGuess?.x ?? null) : null}
              yCoor={guessMode === 'single' ? (singleGuess?.y ?? null) : null}
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
              userVertices={guessMode === 'triangle' ? userVertices : undefined}
              triangleData={(hasSubmitted || isDebugMode) ? triangleData : null}
            />

            {/* Floating Image Preview - Mobile (smaller, tap to enlarge) */}
            {triangleImages.length > 0 && triangleImages[currentImageIndex] && (
              <div
                className="absolute top-3 left-3 z-30 bg-white rounded-lg shadow-2xl border-4 border-blue-500 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                onClick={() => setIsEnlarged(true)}
              >
                <div className="bg-blue-500 text-white px-2 py-1 text-[10px] font-bold flex items-center justify-between">
                  <span>Vertex {currentImageIndex + 1}</span>
                  <span className="opacity-70">Tap to zoom</span>
                </div>
                <img
                  src={triangleImages[currentImageIndex].image}
                  alt={`Vertex ${currentImageIndex + 1}`}
                  className="w-28 h-20 object-cover"
                />
              </div>
            )}

            {/* Fullscreen Image Modal - Mobile */}
            {isEnlarged && triangleImages.length > 0 && triangleImages[currentImageIndex] && (
              <div
                className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
                onClick={() => setIsEnlarged(false)}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/50">
                  <span className="text-white font-bold">Vertex {currentImageIndex + 1} of 3</span>
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
                    src={triangleImages[currentImageIndex].image}
                    alt={`Vertex ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>

                {/* Vertex Navigation */}
                <div className="flex justify-center gap-3 px-4 py-4 bg-black/50">
                  {[0, 1, 2].map((idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                        setActiveVertexIndex(idx);
                      }}
                      className={`
                        px-4 py-2 rounded-lg font-bold text-sm transition
                        ${currentImageIndex === idx
                          ? "bg-blue-500 text-white"
                          : "bg-white/20 text-white hover:bg-white/30"}
                      `}
                    >
                      V{idx + 1}
                      {userVertices[idx] && <span className="ml-1 text-green-400">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Tap to close hint */}
                <div className="text-center text-white/60 text-xs pb-4">
                  Tap anywhere to close
                </div>
              </div>
            )}

            {/* Helper Instruction Overlay */}
            {!hasSubmitted && !userVertices.some(v => v !== null) && guessMode === 'triangle' && (
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full pointer-events-none z-40 text-xs">
                Tap map to place <strong>Vertex {activeVertexIndex + 1}</strong>
              </div>
            )}
          </div>

          {/* Bottom Bar - Controls */}
          <div className="bg-white border-t-2 border-gray-200 shadow-md z-50 px-3 py-3">
            {guessMode === 'triangle' ? (
              <div className="flex flex-col gap-2">
                {/* Vertex Selection */}
                <div className="flex justify-between gap-2">
                  {[0, 1, 2].map((idx) => {
                    const isPlaced = userVertices[idx] !== null;
                    const isActive = activeVertexIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVertexSelect(idx)}
                        className={`
                          flex-1 py-2 px-1 rounded-lg font-semibold text-xs transition-all border
                          flex flex-col items-center justify-center gap-0.5
                          ${isActive ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500 ring-offset-1" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}
                        `}
                      >
                        <span>V{idx + 1}</span>
                        <span className={`text-[9px] ${isPlaced ? "text-green-600 font-bold" : "text-gray-400"}`}>
                          {isPlaced ? "✓" : "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit Button */}
                <button
                  className={`
                    w-full py-3 rounded-xl font-bold text-base shadow-lg transition
                    ${hasSubmitted ? "bg-yellow-500 text-white" : "bg-indigo-600 text-white"}
                    ${gameState.isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={hasSubmitted ? handleNext : handleSubmit}
                  disabled={gameState.isLoading}
                >
                  {gameState.isLoading ? "Processing..." : hasSubmitted ? "Next Round ➔" : "Submit"}
                </button>
              </div>
            ) : (
              /* Quick Guess Mode - Mobile */
              <button
                className={`
                  w-full py-3 rounded-xl font-bold text-base shadow-lg transition
                  ${hasSubmitted ? "bg-yellow-500 text-white" : "bg-indigo-600 text-white"}
                  ${gameState.isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={hasSubmitted ? handleNext : handleSubmit}
                disabled={gameState.isLoading}
              >
                {gameState.isLoading ? "Processing..." : hasSubmitted ? "Next Round ➔" : "Submit Guess"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Save Score Modal */}
      <SaveScoreModal
        isOpen={showSaveScoreModal}
        score={gameState.score}
        rounds={gameState.currentRound}
        onSave={handleSaveScore}
        onSkip={() => { window.location.reload(); }}
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
  );
}
