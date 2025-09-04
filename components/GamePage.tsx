"use client";

import { useEffect, useRef, useState } from "react";
import {
  GameHeader,
  GameControls,
  GameMap,
  ImagePreview,
  useGameState,
  useImageState,
  useMapControls,
  usePerformanceTracking,
  GameMode
} from "./game";

export default function GamePage() {
  // Use modular hooks
  const {
    gameState,
    startGame,
    resetGame,
    submitCoordinates,
    nextRound,
    updateGameState
  } = useGameState();

  const {
    imageState,
    loadNewImage,
    resetImageState
  } = useImageState();

  const {
    mapRef,
    controls: mapControls
  } = useMapControls();

  const {
    recordImageLoaded,
    recordFirstMapClick,
    recordFirstSubmit
  } = usePerformanceTracking();

  // Legacy state for backward compatibility during transition
  const [xCoor, setXCoor] = useState<number | null>(null);
  const [yCoor, setYCoor] = useState<number | null>(null);
  const [xRightCoor, setXRightCoor] = useState<number | null>(null);
  const [yRightCoor, setYRightCoor] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  // Initialize game
  useEffect(() => {
    if (!gameState.isStarted) {
      startGame(GameMode.SinglePlayer);
      loadNewImage();
    }
  }, [gameState.isStarted, startGame, loadNewImage]);

  // Load natural size when image changes
  useEffect(() => {
    let mounted = true;
    setNaturalSize(null);
    
    if (!imageState.currentImageSrc) return;

    const img = new Image();
    img.onload = () => {
      if (!mounted) return;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      recordImageLoaded();
    };
    img.onerror = () => {
      if (!mounted) return;
      setNaturalSize(null);
    };
    img.src = imageState.currentImageSrc;

    return () => {
      mounted = false;
    };
  }, [imageState.currentImageSrc, recordImageLoaded]);

  const handleCoordinateClick = (x: number | null, y: number | null) => {
    recordFirstMapClick();
    
    if (x !== null) setXCoor(x);
    if (y !== null) setYCoor(y);
    
    updateGameState({
      userCoordinates: x !== null && y !== null ? { x, y } : gameState.userCoordinates
    });
  };

  const handleSubmit = async () => {
    if (xCoor === null || yCoor === null) return;

    recordFirstSubmit();
    // Pass image/location ID for backend validation
    await submitCoordinates(xCoor, yCoor, imageState.currentImageName);

    // Update legacy state for visualization
    if (gameState.correctCoordinates) {
      setXRightCoor(gameState.correctCoordinates.x);
      setYRightCoor(gameState.correctCoordinates.y);

      // Zoom to show both markers
      if (mapRef.current) {
        mapControls.zoomToArea(
          xCoor,
          yCoor,
          gameState.correctCoordinates.x,
          gameState.correctCoordinates.y
        );
      }
    }
  };

  const handleNext = async () => {
    // Check if game should end
    if (gameState.currentRound >= gameState.maxRounds) {
      alert(`Game over! You scored a total of ${gameState.score} points.`);
      resetGame();
      resetImageState();
    } else {
      // Load next image and reset coordinates
      await loadNewImage();
      setXCoor(null);
      setYCoor(null);
      setXRightCoor(null);
      setYRightCoor(null);
      
      // Reset map zoom
      if (mapRef.current) {
        mapControls.resetZoom();
      }
      
      nextRound();
    }
  };

  const isDisabled = xRightCoor !== null && yRightCoor !== null;
  const hasSubmitted = gameState.isSubmitted && gameState.correctCoordinates !== null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 flex-wrap gap-1">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <GameHeader
          totalPoints={gameState.score}
          currentRound={gameState.currentRound}
          maxRounds={gameState.maxRounds}
        />

        <div className="flex items-center justify-center w-full h-full">
          <div className="flex flex-row items-center justify-between w-full h-full max-w-6xl max-h-[92vh] mx-auto my-auto bg-white rounded shadow-lg overflow-hidden relative">
            {/* Left side: controls (optional, can add more UI here) */}
            <div className="flex flex-col justify-center items-center w-1/3 h-full">
              <GameControls
                onSubmit={handleSubmit}
                onNext={handleNext}
                hasSubmitted={hasSubmitted}
                isLoading={gameState.isLoading}
              />
              {/* You can add more info or UI here if desired */}
            </div>
            {/* Right side: map */}
            <div className="flex justify-center items-center w-2/3 h-full">
              <GameMap
                ref={mapRef}
                xCoor={xCoor}
                yCoor={yCoor}
                xRightCoor={xRightCoor}
                yRightCoor={yRightCoor}
                onCoordinateClick={handleCoordinateClick}
                disabled={isDisabled}
              />
            </div>
          </div>
        </div>

        {imageState.currentImageSrc && (
          <ImagePreview
            imageSrc={imageState.currentImageSrc}
            naturalSize={naturalSize}
          />
        )}
      </div>
    </div>
  );
}
