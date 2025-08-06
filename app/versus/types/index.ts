export interface GameState {
  id?: string;
  image?: string;
  correctX?: number;
  correctY?: number;
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  points: number;
  totalPoints: number;
  correctX: number;
  correctY: number;
  roundComplete: boolean;
  opponentPoints?: number;
}

export interface RoundData {
  roundId: string;
  imageId: string;
  correctX: number;
  correctY: number;
  timestamp: number;
}

export interface VersusPageState {
  sessionId: string | null;
  partnerId: string | null;
  isConnected: boolean;
  state: GameState;
  toast: string | null;
  showResult: boolean;
  imageIDs: string[];
  totalPoints: number;
  partnerPoints: number;
  questionCount: number;
  hasSubmitted: boolean;
  opponentHasSubmitted: boolean;
  isRoundComplete: boolean;
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
}
