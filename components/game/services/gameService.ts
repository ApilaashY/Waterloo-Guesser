import { useSession } from "@/components/SessionProvider";
import { GameState, CoordinateState, Coordinates } from "../types/game";

export class GameService {
  private static instance: GameService;

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  public static generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public static async submitCoordinates(
    x: number,
    y: number,
    gameId: string | null,
    userId: string | null
  ) {
    try {
      console.log({
        xCoor: x,
        yCoor: y,
        id: gameId,
        userId: userId,
      });

      // API expects xCoor, yCoor, and id
      const response = await fetch("/api/validateCoordinate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xCoor: x,
          yCoor: y,
          id: gameId,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`HTTP error! status: ${response.status} ${text}`);
      }

      const result = await response.json();
      // response returns xCoor/yCoor for correct coordinates and points
      return {
        correctCoordinates: {
          x: result.xCoor ?? result.correctX ?? null,
          y: result.yCoor ?? result.correctY ?? null,
        },
        distance: result.distance ?? null,
        points: result.points ?? 0,
      };
    } catch (error) {
      console.error("Failed to submit coordinates:", error);
      throw error;
    }
  }

  public checkGameEnd(round: number): boolean {
    return round >= 5;
  }

  public getEndGameMessage(totalPoints: number): string {
    return `Game over! You scored a total of ${totalPoints} points.`;
  }

  public resetGame(): Partial<GameState & CoordinateState> {
    return {
      gameId: null,
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
      xCoor: null,
      yCoor: null,
      xRightCoor: null,
      yRightCoor: null,
    };
  }

  public incrementRound(currentRound: number): number {
    return currentRound + 1;
  }

  public updateScore(currentPoints: number, newPoints: number): number {
    return currentPoints + newPoints;
  }

  public incrementQuestionCount(currentCount: number): number {
    return currentCount + 1;
  }
}
