"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GameHeader,
  GameControls,
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
import SaveScoreModal from "./game/components/SaveScoreModal";
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
    submitCoordinates,
    nextRound,
    updateGameState,
  } = useGameState();
  const { user } = useSession();

  const { imageState, loadNewImage, resetImageState } = useImageState();

  const { mapRef, controls: mapControls } = useMapControls();

  const { recordImageLoaded, recordFirstMapClick, recordFirstSubmit } =
    usePerformanceTracking();

  const router = useRouter();

  // Triangle-specific state
  const [triangleImages, setTriangleImages] = useState<any[]>([]);
  const [triangleData, setTriangleData] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Function to generate and get daily session ID - same as GamePage
  const getDailySessionId = (): string => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storageKey = `dailySessionId_${today}`;
    
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      // Fallback for server-side or when localStorage is not available
      const randomPart = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      return `${today}_${randomPart}`;
    }
    
    // Check if we already have a session ID for today
    let sessionId = localStorage.getItem(storageKey);
    
    if (!sessionId) {
      // Generate new session ID: date + random string
      const randomPart = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      sessionId = `${today}_${randomPart}`;
      
      // Store it for today
      localStorage.setItem(storageKey, sessionId);
      
      // Clean up old session IDs (keep only today's)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('dailySessionId_') && key !== storageKey) {
          localStorage.removeItem(key);
        }
      });
    }
    
    return sessionId;
  };

  // Legacy state for backward compatibility during transition - same as GamePage
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false); // Track enlarged state
  const [zoom, setZoom] = useState(1); // Track zoom level
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Track pan position

  // Save score modal state - same as GamePage
  const [showSaveScoreModal, setShowSaveScoreModal] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Timing state for server-side scoring - same as GamePage
  const [imageLoadedAt, setImageLoadedAt] = useState<number | null>(null);
  const [guessSubmittedAt, setGuessSubmittedAt] = useState<number | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // Triangle-specific image loading
  const loadTriangleImages = async () => {
    try {
      const response = await fetch("/api/getPhoto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "triangle",
          previousCodes: [] // TODO: Track used images
        })
      });

      if (!response.ok) {
        throw new Error("Failed to load triangle images");
      }

      const data = await response.json();
      setTriangleImages(data.images);
      setTriangleData(data.triangleData);
      setCurrentImageIndex(0);
      
      // Set the first image as current for the existing game logic
      if (data.images.length > 0) {
        // Update imageState to use first image
        const firstImage = data.images[0];
        // Manually set image state to work with existing components
        imageState.currentImageSrc = firstImage.image;
        imageState.currentImageName = firstImage.id;
      }
    } catch (error) {
      console.error("Error loading triangle images:", error);
      toast.error("Failed to load triangle images");
    }
  };

  // Initialize game - modified for triangle mode
  useEffect(() => {
    if (!gameState.isStarted) {
      startGame(GameMode.SinglePlayer);
      loadTriangleImages();
    }
  }, [gameState.isStarted, startGame]);

  // Load natural size when current triangle image changes - same as GamePage but for triangle
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);
    setImageLoadedAt(null);

    if (triangleImages.length === 0 || !triangleImages[currentImageIndex]) return;

    const currentImage = triangleImages[currentImageIndex];
    setCurrentImageId(currentImage.id);

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageLoadedAt(Date.now());
      recordImageLoaded();
    };
    img.onerror = () => {
      if (!mounted) return;
      setNaturalSize(null);
      setImageLoadedAt(null);
    };
    img.src = currentImage.image;

    return () => {
      mounted = false;
    };
  }, [triangleImages, currentImageIndex, recordImageLoaded]);

  const handleCoordinateClick = (x: number | null, y: number | null) => {
    recordFirstMapClick();

    if (x !== null) setXCoor(x);
    if (y !== null) setYCoor(y);

    updateGameState({
      userCoordinates:
        x !== null && y !== null ? { x, y } : gameState.userCoordinates,
    });
  };

  const handleSubmit = async () => {
    if (xCoor === null || yCoor === null || !triangleData) return;

    // Capture when user submitted their guess
    setGuessSubmittedAt(Date.now());

    recordFirstSubmit();
    
    // Calculate distance to centroid for triangle scoring
    const centroid = triangleData.centroid;
    const distance = Math.sqrt(
      Math.pow(xCoor - centroid.x, 2) +
      Math.pow(yCoor - centroid.y, 2)
    );

    // Score based on proximity to centroid (closer = higher score)
    const maxDistance = 0.3;
    const baseScore = Math.max(0, Math.round(1000 * (1 - distance / maxDistance)));

    // Update game state with triangle-specific scoring
    const roundResult = {
      round: gameState.currentRound,
      userCoordinates: { x: xCoor, y: yCoor },
      correctCoordinates: { x: centroid.x, y: centroid.y },
      distance,
      points: baseScore,
    };

    updateGameState({
      correctCoordinates: { x: centroid.x, y: centroid.y },
      isSubmitted: true,
      score: gameState.score + baseScore,
      distance,
      points: baseScore,
      roundResults: [...gameState.roundResults, roundResult]
    });

    toast.success(`You scored ${baseScore} points! Distance to centroid: ${(distance * 100).toFixed(1)}%`);
  };

  // Set xRightCoor/yRightCoor after correctCoordinates is updated - same as GamePage
  useEffect(() => {
    if (gameState.isSubmitted && gameState.correctCoordinates) {
      setXRightCoor(gameState.correctCoordinates.x);
      setYRightCoor(gameState.correctCoordinates.y);

      // Zoom to show both markers
      if (mapRef.current && xCoor !== null && yCoor !== null) {
        mapControls.zoomToArea(
          xCoor,
          yCoor,
          gameState.correctCoordinates.x,
          gameState.correctCoordinates.y
        );
      }
    }
  }, [gameState.isSubmitted, gameState.correctCoordinates]);

  const handleNext = async () => {
    // Check if game should end - same as GamePage
    if (gameState.currentRound >= gameState.maxRounds) {
      // Submit match data to the API
      try {
        const matchService = MatchService.getInstance();
        const matchData = matchService.createMatchSubmission(
          gameState,
          user?.id,
          gameState.gameId ? parseInt(gameState.gameId) : Date.now()
        );

        const result = await matchService.submitMatch(matchData);
        console.log("Match submitted successfully:", result);
      } catch (error) {
        console.error("Error submitting match:", error);
        // Don't prevent game from ending if submission fails
      }

      // For game end, show save score modal if user is not signed in
      if (!user) {
        setShowSaveScoreModal(true);
      } else {
        resetGame();
        resetImageState();
        setXCoor(null);
        setYCoor(null);
        setXRightCoor(null);
        setYRightCoor(null);
      }
    } else {
      // Continue to next round
      proceedToNextRound();
    }
  };

  const proceedToNextRound = () => {
    // Load next triangle images and reset coordinates
    loadTriangleImages();
    setXCoor(null);
    setYCoor(null);
    setXRightCoor(null);
    setYRightCoor(null);

    // Reset timing data for the next round
    setImageLoadedAt(null);
    setGuessSubmittedAt(null);
    setCurrentImageId(null);

    // Reset map zoom
    if (mapRef.current) {
      mapControls.resetZoom();
    }

    nextRound();
  };

  const handleSaveScore = async () => {
    setIsSavingScore(true);
    try {
      // Get unique daily session ID - same as GamePage
      const dailySessionId = getDailySessionId();
      
      // Prepare data for server-side scoring
      const scoringData = {
        username: undefined, // No username - will be auto-generated
        score: gameState.score,
        rounds: gameState.currentRound,
        sessionId: dailySessionId,
        // Include timing and accuracy data for server-side processing
        imageId: currentImageId || undefined,
        userCoordinates: xCoor !== null && yCoor !== null ? { x: xCoor, y: yCoor } : undefined,
        correctCoordinates: gameState.correctCoordinates || undefined,
        imageLoadedAt: imageLoadedAt || undefined,
        guessSubmittedAt: guessSubmittedAt || undefined,
      };
      
      const result = await GameService.saveToDailyLeaderboard(
        scoringData.username,
        scoringData.score,
        scoringData.rounds,
        scoringData.sessionId,
        scoringData.imageId,
        scoringData.userCoordinates,
        scoringData.correctCoordinates,
        scoringData.imageLoadedAt,
        scoringData.guessSubmittedAt
      );
      
      setShowSaveScoreModal(false);
      
      // Show a separate toast for each achievement
      if (result.achievements && result.achievements.length > 0) {
        result.achievements.forEach((ach: any) => {
          const code = result.buildingIdentifier || result.uniqueCode || '';
          let achievementLabel = '';
          if (ach.type && ach.scope) {
            achievementLabel = `${ach.type.replace('_', ' ')} (${ach.scope.replace('_', ' ')})`;
          } else if (ach.type) {
            achievementLabel = ach.type.replace('_', ' ');
          } else {
            achievementLabel = 'Achievement';
          }
          toast.success(
            `🏆 ${code ? code + ' — ' : ''}${achievementLabel}\nScore saved as ${result.username}!`
          );
        });
      } else {
        toast.success(`Score saved as ${result.username}!`);
      }
      
      // If this was after the first round, proceed to next round
      // If this was after the final round, end the game
      if (gameState.currentRound >= gameState.maxRounds) {
        alert(`Game over! You scored a total of ${gameState.score} points.`);
        resetGame();
        resetImageState();
        setXCoor(null);
        setYCoor(null);
        setXRightCoor(null);
        setYRightCoor(null);
      } else {
        proceedToNextRound();
      }
    } catch (error) {
      console.error('Failed to save score:', error);
      toast.error('Failed to save score. Please try again.');
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleSkipSaveScore = () => {
    setShowSaveScoreModal(false);
    
    // If this was after the first round, proceed to next round
    // If this was after the final round, end the game
    if (gameState.currentRound >= gameState.maxRounds) {
      alert(`Game over! You scored a total of ${gameState.score} points.`);
      resetGame();
      resetImageState();
      setXCoor(null);
      setYCoor(null);
      setXRightCoor(null);
      setYRightCoor(null);
    } else {
      proceedToNextRound();
    }
  };

  const handleSignUp = () => {
    // Store the current game state in session storage so it can be restored after sign up
    sessionStorage.setItem('pendingScore', JSON.stringify({
      score: gameState.score,
      rounds: gameState.currentRound,
      timestamp: new Date().toISOString()
    }));
    
    // Navigate to registration page
    router.push('/register');
  };

  const isDisabled = xRightCoor !== null && yRightCoor !== null;
  const hasSubmitted =
    gameState.isSubmitted && gameState.correctCoordinates !== null;

  // Login toast - same as GamePage
  useEffect(() => {
    if (!user) {
      toast.dismiss("login-toast");
      toast(
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-yellow-900">
            Not logged in:{" "}
            <span className="font-normal">
              Log in to save your scores to your profile!
            </span>
          </span>
          <button
            className="ml-2 px-2 py-1 rounded bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold focus:outline-none transition-colors duration-150"
            aria-label="Close login toast"
            onClick={() => toast.dismiss("login-toast")}
          >
            &#10005;
          </button>
        </div>,
        {
          id: "login-toast",
          duration: Infinity,
          position: "top-center",
          style: {
            background: "#FEF3C7", // Tailwind yellow-100
            color: "#B45309", // Tailwind yellow-800
            border: "1px solid #F59E0B", // Tailwind yellow-400
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "0.75rem",
            padding: "1rem 1.5rem",
            fontFamily: "inherit",
            fontWeight: 500,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          },
          icon: null,
        }
      );
    } else {
      toast.dismiss("login-toast");
    }
  }, [user]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 flex-wrap gap-1">
      <Toaster
        toastOptions={{
          success: { iconTheme: { primary: "#22c55e", secondary: "#f0fdf4" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fef2f2" } },
        }}
        position="top-center"
        containerStyle={{ top: 24 }}
      />
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="flex items-center justify-center w-full h-full">
          <div className="flex flex-row items-center justify-between w-full h-full mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">
            {/* Left side: controls (same as GamePage) */}
            <div className="flex flex-col justify-center items-center w-1/3 h-full">
              <GameControls
                onSubmit={handleSubmit}
                onNext={handleNext}
                hasSubmitted={hasSubmitted}
                isLoading={gameState.isLoading}
                score={gameState.score}
                round={gameState.currentRound}
                maxRounds={gameState.maxRounds}
                isModalOpen={showSaveScoreModal}
              />
            </div>
            {/* Right side: map with triangle overlay */}
            <div
              className={`flex justify-center items-center h-full w-2/3 max-md:fixed max-md:w-screen max-md:h-screen`}
            >
              <GameMap
                ref={mapRef}
                xCoor={xCoor}
                yCoor={yCoor}
                xRightCoor={xRightCoor}
                yRightCoor={yRightCoor}
                onCoordinateClick={handleCoordinateClick}
                disableClickOnly={isDisabled}
                enlarged={isEnlarged}
                currentScore={
                  gameState.roundResults.length > 0
                    ? gameState.roundResults[gameState.roundResults.length - 1]
                        .points
                    : 0
                }
                overrideZoom={zoom}
                setOverrideZoom={setZoom}
                overridePan={pan}
                setOverridePan={setPan}
              />
              
              {/* Triangle Overlay */}
              {triangleData && triangleData.vertices && triangleData.vertices.length === 3 && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <svg className="w-full h-full">
                    <polygon
                      points={triangleData.vertices
                        .map((v: any) => `${v.x * 100}%,${v.y * 100}%`)
                        .join(' ')}
                      fill="rgba(255, 255, 0, 0.2)"
                      stroke="rgba(255, 255, 0, 0.8)"
                      strokeWidth="2"
                    />
                    
                    {/* Vertex markers */}
                    {triangleData.vertices.map((vertex: any, index: number) => (
                      <circle
                        key={index}
                        cx={`${vertex.x * 100}%`}
                        cy={`${vertex.y * 100}%`}
                        r="6"
                        fill="blue"
                        stroke="white"
                        strokeWidth="2"
                      />
                    ))}
                    
                    {/* Centroid marker (only show during results) */}
                    {hasSubmitted && triangleData.centroid && (
                      <circle
                        cx={`${triangleData.centroid.x * 100}%`}
                        cy={`${triangleData.centroid.y * 100}%`}
                        r="4"
                        fill="red"
                        stroke="white"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Triangle Image Preview - replace ImagePreview with custom version */}
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

        {/* Save Score Modal - same as GamePage */}
        <SaveScoreModal
          isOpen={showSaveScoreModal}
          score={gameState.score}
          rounds={gameState.currentRound}
          onSave={handleSaveScore}
          onSkip={handleSkipSaveScore}
          onClose={handleSkipSaveScore}
          onSignUp={handleSignUp}
          isLoading={isSavingScore}
        />
      </div>
    </div>
  );
}
