"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GameHeader,
  GameControls,
  GameMap,
  ImagePreview,
  useGameState,
  useImageState,
  useMapControls,
  GameMode,
} from "./game";
import TutorialOverlay, { TutorialStep } from "./game/components/TutorialOverlay";

// Tutorial steps configuration
const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: "Welcome to Waterloo Guesser!",
    description: "Test your knowledge of the UW campus by identifying where photos were taken. You'll see a photo and need to click on the map where you think it was taken. Let's learn how to play!",
    position: "center",
    action: "none",
    requiredAction: false,
  },
  {
    id: 1,
    title: "View the Photo",
    description: "This is the photo you need to identify. Look for landmarks, buildings, or unique features that might help you recognize the location on campus.",
    highlightElement: "image-preview",
    position: "right",
    action: "none",
    requiredAction: false,
  },
  {
    id: 2,
    title: "Check Your Stats",
    description: "Here you can see your current score and which round you're on. Each game has 5 rounds, and you earn points based on how close your guess is to the actual location.",
    highlightElement: "score-display",
    position: "right",
    action: "none",
    requiredAction: false,
  },
  {
    id: 3,
    title: "Make Your Guess",
    description: "Click anywhere on the map where you think the photo was taken. A red marker will appear at your chosen location. Try clicking on the map now!",
    highlightElement: "game-map",
    position: "left",
    action: "click-map",
    requiredAction: true,
  },
  {
    id: 4,
    title: "Submit Your Answer",
    description: "Once you've placed your marker, click the Submit button to see how you did. The closer you are to the actual location, the more points you earn!",
    highlightElement: "submit-button",
    position: "right",
    action: "click-submit",
    requiredAction: true,
  },
  {
    id: 5,
    title: "See Your Results",
    description: "After submitting, you'll see both your guess (red) and the correct location (green). The map will zoom to show both markers, and you'll see your score for this round.",
    highlightElement: "game-map",
    position: "left",
    action: "none",
    requiredAction: false,
  },
  {
    id: 6,
    title: "Keyboard Shortcuts",
    description: "Save time with keyboard shortcuts! Press ENTER or SPACE to submit your guess. Press CTRL to toggle fullscreen on the photo.",
    position: "center",
    action: "none",
    requiredAction: false,
  },
  {
    id: 7,
    title: "Ready to Play!",
    description: "You're all set! Complete 5 rounds to finish the game. Your final score will be saved to the leaderboard. Good luck, and have fun exploring the UW campus!",
    position: "center",
    action: "none",
    requiredAction: false,
  },
];

export default function TutorialGamePage() {
  // Use modular hooks
  const {
    gameState,
    startGame,
    resetGame,
    submitCoordinates,
    nextRound,
    updateGameState,
  } = useGameState();

  const { imageState, loadNewImage, resetImageState } = useImageState();
  const { mapRef, controls: mapControls } = useMapControls();
  const router = useRouter();

  // Tutorial state
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [mapClickCompleted, setMapClickCompleted] = useState(false);
  const [submitCompleted, setSubmitCompleted] = useState(false);
  const [imagePreviewDimensions, setImagePreviewDimensions] = useState<{ width: number; height: number; left: number; bottom: number } | null>(null);

  // Legacy state for backward compatibility
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Initialize game immediately (no start overlay for tutorial)
  useEffect(() => {
    if (!gameState.isStarted) {
      startGame(GameMode.SinglePlayer);
      loadNewImage();
    }
  }, [gameState.isStarted, startGame, loadNewImage]);

  // Debug logging for action completion
  useEffect(() => {
    console.log('Action states changed - MapClick:', mapClickCompleted, 'Submit:', submitCompleted);
  }, [mapClickCompleted, submitCompleted]);

  // Auto-detect map click completion based on coordinates
  useEffect(() => {
    if (currentStep === 3 && xCoor !== null && yCoor !== null && !mapClickCompleted) {
      console.log('Auto-detecting map click from coordinates:', xCoor, yCoor);
      setMapClickCompleted(true);
    }
  }, [currentStep, xCoor, yCoor, mapClickCompleted]);

  // Load natural size when image changes
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);

    if (!imageState.currentImageSrc) return;

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      if (!mounted) return;
      setNaturalSize(null);
    };
    img.src = imageState.currentImageSrc;

    return () => {
      mounted = false;
    };
  }, [imageState.currentImageSrc]);

  // Calculate image preview dimensions for tutorial highlighting
  useEffect(() => {
    if (!naturalSize) {
      setImagePreviewDimensions(null);
      return;
    }

    // Calculate dimensions based on ImagePreview logic
    const vw = typeof window !== 'undefined' ? Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) : 1200;
    const vh = typeof window !== 'undefined' ? Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) : 800;
    const isMobile = typeof window !== 'undefined' && vw < 768;

    const isLarge = isEnlarged;
    const maxW = isLarge ? (isMobile ? Math.floor(vw * 0.85) : Math.floor(vw * 0.5)) : Math.floor(vw * 0.3);
    const maxH = isLarge ? (isMobile ? Math.floor(vh * 0.75) : Math.floor(vh - 82)) : Math.floor(vh * 0.4);
    const imgW = naturalSize.w;
    const imgH = naturalSize.h;
    const scaleW = maxW / imgW;
    const scaleH = maxH / imgH;
    const fitScale = Math.min(scaleW, scaleH, 1);
    const containerWidth = Math.round(imgW * fitScale);
    const containerHeight = Math.round(imgH * fitScale);

    // Desktop positioning: left: 50px, bottom: 50px
    // Mobile positioning varies, but tutorial doesn't run on mobile enlarged view
    const left = isMobile ? 5 : 50;
    const bottom = isMobile ? 5 : 50;

    setImagePreviewDimensions({
      width: isMobile ? containerWidth * 1.75 : containerWidth,
      height: isMobile ? containerHeight * 1.75 : containerHeight,
      left,
      bottom,
    });
  }, [naturalSize, isEnlarged]);

  const handleCoordinateClick = (x: number | null, y: number | null) => {
    if (x !== null) setXCoor(x);
    if (y !== null) setYCoor(y);

    updateGameState({
      userCoordinates:
        x !== null && y !== null ? { x, y } : gameState.userCoordinates,
    });

    // Mark map click as completed (for tutorial step 3)
    if (x !== null && y !== null) {
      console.log('Map clicked at:', x, y, 'Current step:', currentStep);
      if (currentStep === 3) {
        console.log('Marking map click as completed');
        setMapClickCompleted(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (xCoor === null || yCoor === null) return;

    console.log('Submit clicked, Current step:', currentStep);
    await submitCoordinates(xCoor, yCoor, imageState.currentImageName, null);

    // Mark submit as completed (for tutorial step 4)
    if (currentStep === 4) {
      console.log('Marking submit as completed');
      setSubmitCompleted(true);
    }
  };

  // Set xRightCoor/yRightCoor after correctCoordinates is updated
  useEffect(() => {
    if (gameState.isSubmitted && gameState.correctCoordinates) {
      console.log('Game submitted with correct coordinates:', gameState.correctCoordinates);
      setXRightCoor(gameState.correctCoordinates.x);
      setYRightCoor(gameState.correctCoordinates.y);

      // Auto-detect submit completion for tutorial
      if (currentStep === 4 && !submitCompleted) {
        console.log('Auto-detecting submit completion from gameState');
        setSubmitCompleted(true);
      }

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
  }, [gameState.isSubmitted, gameState.correctCoordinates, currentStep, submitCompleted]);

  const handleNext = () => {
    // In tutorial mode, just reset for next round without ending
    if (gameState.currentRound >= gameState.maxRounds) {
      handleTutorialComplete();
    } else {
      proceedToNextRound();
    }
  };

  const proceedToNextRound = () => {
    loadNewImage();
    setXCoor(null);
    setYCoor(null);
    setXRightCoor(null);
    setYRightCoor(null);

    if (mapRef.current) {
      mapControls.resetZoom();
    }

    nextRound();
  };

  const handleTutorialComplete = () => {
    // Mark tutorial as completed in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorialCompleted', 'true');
    }

    // Hide tutorial overlay and let user continue playing
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    // Mark tutorial as completed (skipped)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorialCompleted', 'true');
    }

    // Navigate back to modes page
    router.push('/modes');
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);

    // Reset action completion flags when changing steps
    if (newStep !== 3) setMapClickCompleted(false);
    if (newStep !== 4) setSubmitCompleted(false);
  };

  // Determine which action is completed based on current step
  const getActionCompleted = () => {
    const completed = currentStep === 3 ? mapClickCompleted : currentStep === 4 ? submitCompleted : false;
    console.log('getActionCompleted - Step:', currentStep, 'MapClick:', mapClickCompleted, 'Submit:', submitCompleted, 'Returning:', completed);
    return completed;
  };

  const isDisabled = xRightCoor !== null && yRightCoor !== null;
  const hasSubmitted = gameState.isSubmitted && gameState.correctCoordinates !== null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 flex-wrap gap-1">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="flex items-center justify-center w-full h-full">
          <div className="flex flex-row items-center justify-between w-full h-full mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">
            {/* Left side: controls */}
            <div className="flex flex-col justify-center items-center w-1/3 h-full">
              <GameControls
                onSubmit={handleSubmit}
                onNext={handleNext}
                hasSubmitted={hasSubmitted}
                isLoading={gameState.isLoading}
                score={gameState.score}
                round={gameState.currentRound}
                maxRounds={gameState.maxRounds}
                isModalOpen={false}
              />
            </div>

            {/* Right side: map */}
            <div className="flex justify-center items-center h-full w-2/3 max-md:fixed max-md:w-screen max-md:h-screen">
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
                    ? gameState.roundResults[gameState.roundResults.length - 1].points
                    : 0
                }
                overrideZoom={zoom}
                setOverrideZoom={setZoom}
                overridePan={pan}
                setOverridePan={setPan}
              />
            </div>
          </div>
        </div>

        {imageState.currentImageSrc && (
          <ImagePreview
            imageSrc={imageState.currentImageSrc}
            naturalSize={naturalSize}
            enlarged={isEnlarged}
            setEnlarged={setIsEnlarged}
          />
        )}

        {/* Tutorial Overlay */}
        {showTutorial && (
          <TutorialOverlay
            steps={TUTORIAL_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
            actionCompleted={getActionCompleted()}
            imagePreviewDimensions={imagePreviewDimensions}
          />
        )}
      </div>
    </div>
  );
}
