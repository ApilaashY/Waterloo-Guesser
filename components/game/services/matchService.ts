import { GameState, RoundResult, GameMode } from '../types/game';

export interface MatchSubmissionData {
  gameId?: string;
  playerId?: string;
  mode: GameMode;
  totalScore: number;
  rounds: Array<{
    round: number;
    locationId?: string;
    userCoordinates: {
      x: number;
      y: number;
    };
    correctCoordinates: {
      x: number;
      y: number;
    };
    distance: number;
    points: number;
    timestamp?: string;
  }>;
  completedAt: string;
  sessionDuration?: number;
  performanceMetrics?: {
    imageLoadedAt?: number;
    firstMapClickRecorded?: boolean;
    firstSubmitRecorded?: boolean;
  };
}

export class MatchService {
  private static instance: MatchService;

  public static getInstance(): MatchService {
    if (!MatchService.instance) {
      MatchService.instance = new MatchService();
    }
    return MatchService.instance;
  }

  /**
   * Submit match data to the API
   */
  public async submitMatch(data: MatchSubmissionData): Promise<any> {
    try {
      console.log('Submitting match data:', data);
      console.log('Rounds data:', data.rounds);
      
      const response = await fetch('/api/submitMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to submit match:', error);
      throw error;
    }
  }

  /**
   * Get match history for a player
   */
  public async getMatchHistory(playerId: string, limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`/api/submitMatch?playerId=${playerId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get match history:', error);
      throw error;
    }
  }

  /**
   * Get a specific match by ID
   */
  public async getMatch(matchId: string): Promise<any> {
    try {
      const response = await fetch(`/api/submitMatch?matchId=${matchId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get match:', error);
      throw error;
    }
  }

  /**
   * Create match submission data from game state
   */
  public createMatchSubmission(
    gameState: GameState,
    userId?: string,
    startTime?: number
  ): MatchSubmissionData {
    const now = new Date().toISOString();
    
    // Ensure we have round results to submit
    if (!gameState.roundResults || gameState.roundResults.length === 0) {
      throw new Error('Cannot create match submission: no round results available');
    }
    
    console.log('Creating match submission from game state:', gameState);
    console.log('Round results:', gameState.roundResults);
    
    return {
      gameId: gameState.gameId || undefined,
      playerId: userId || undefined,
      mode: gameState.mode,
      totalScore: gameState.score,
      rounds: gameState.roundResults.map(result => {
        console.log('Processing round result:', result);
        return {
          round: result.round,
          userCoordinates: result.userCoordinates,
          correctCoordinates: result.correctCoordinates,
          distance: result.distance,
          points: result.points,
          timestamp: now
        };
      }),
      completedAt: now,
      sessionDuration: startTime ? Date.now() - startTime : undefined,
      performanceMetrics: {
        imageLoadedAt: Date.now(),
        firstMapClickRecorded: true,
        firstSubmitRecorded: true
      }
    };
  }
}
