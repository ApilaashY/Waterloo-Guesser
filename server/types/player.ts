export interface QueueItem {
  sessionId: string;
  socket: any;
  partnerId?: string;
  correctX?: number;
  correctY?: number;
  hasSubmitted?: boolean;
  score: number;
}

export interface PlayerSession {
  matchId: string;
  socket: any;
}

export interface GameState {
  score: number;
  hasSubmitted: boolean;
}
