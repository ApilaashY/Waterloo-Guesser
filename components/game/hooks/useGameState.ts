import { useState, useCallback } from "react";
import { GameState, GameMode, GameResult, RoundResult } from "../types/game";
import { GameService } from "../services/gameService";

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    mode: GameMode.SinglePlayer,
    isStarted: false,
    isSubmitted: false,
    isResultVisible: false,
    isLoading: false,
    score: 0,
    lives: 3,
    currentRound: 1,
    maxRounds: 5,
    userCoordinates: null,
    correctCoordinates: null,
    distance: null,
    points: null,
    gameResults: [],
    roundResults: [],
  });

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  }, []);

  const startGame = useCallback((mode: GameMode = GameMode.SinglePlayer) => {
    const gameId = GameService.generateGameId();
    setGameState((prev) => ({
      ...prev,
      gameId,
      mode,
      isStarted: true,
      isSubmitted: false,
      isResultVisible: false,
      isLoading: false,
      score: 0,
      lives: 3,
      currentRound: 1,
      userCoordinates: null,
      correctCoordinates: null,
      distance: null,
      points: null,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      gameId: null,
      mode: GameMode.SinglePlayer,
      isStarted: false,
      isSubmitted: false,
      isResultVisible: false,
      isLoading: false,
      score: 0,
      lives: 3,
      currentRound: 1,
      maxRounds: 5,
      userCoordinates: null,
      correctCoordinates: null,
      distance: null,
      points: null,
      gameResults: [],
      roundResults: [],
    });
  }, []);

  const submitCoordinates = useCallback(
    async (
      x: number,
      y: number,
      imageId: string | null,
      userId: string | null
    ) => {
      updateGameState({
        isSubmitted: true,
        isLoading: true,
        userCoordinates: { x, y },
      });

      try {
        // Use image/location ID for API, not game/session ID
        const result = await GameService.submitCoordinates(
          x,
          y,
          imageId ?? null,
          userId
        );

        const roundResult: RoundResult = {
          round: gameState.currentRound,
          userCoordinates: { x, y },
          correctCoordinates: result.correctCoordinates,
          distance: result.distance,
          points: result.points,
        };

        updateGameState({
          isLoading: false,
          isResultVisible: true,
          correctCoordinates: result.correctCoordinates,
          distance: result.distance,
          points: result.points,
          score: gameState.score + result.points,
          roundResults: [...gameState.roundResults, roundResult],
        });
      } catch (error) {
        console.error("Failed to submit coordinates:", error);
        updateGameState({ isLoading: false });
      }
    },
    [
      gameState.currentRound,
      gameState.score,
      gameState.roundResults,
      updateGameState,
    ]
  );

  const nextRound = useCallback(() => {
    if (gameState.currentRound >= gameState.maxRounds) {
      const gameResult: GameResult = {
        mode: gameState.mode,
        totalScore: gameState.score,
        roundResults: gameState.roundResults,
        completedAt: new Date().toISOString(),
      };

      updateGameState({
        gameResults: [...gameState.gameResults, gameResult],
        isStarted: false,
      });
    } else {
      updateGameState({
        currentRound: gameState.currentRound + 1,
        isSubmitted: false,
        isResultVisible: false,
        userCoordinates: null,
        correctCoordinates: null,
        distance: null,
        points: null,
      });
    }
  }, [
    gameState.currentRound,
    gameState.maxRounds,
    gameState.score,
    gameState.mode,
    gameState.roundResults,
    gameState.gameResults,
    updateGameState,
  ]);

  const loseLife = useCallback(() => {
    const newLives = gameState.lives - 1;
    updateGameState({ lives: newLives });

    if (newLives <= 0) {
      const gameResult: GameResult = {
        mode: gameState.mode,
        totalScore: gameState.score,
        roundResults: gameState.roundResults,
        completedAt: new Date().toISOString(),
      };

      updateGameState({
        gameResults: [...gameState.gameResults, gameResult],
        isStarted: false,
      });
    }
  }, [
    gameState.lives,
    gameState.mode,
    gameState.score,
    gameState.roundResults,
    gameState.gameResults,
    updateGameState,
  ]);

  return {
    gameState,
    updateGameState,
    startGame,
    resetGame,
    submitCoordinates,
    nextRound,
    loseLife,
  };
};
