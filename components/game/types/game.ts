export enum GameMode {
  SinglePlayer = 'singlePlayer',
  Multiplayer = 'multiplayer'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface RoundResult {
  round: number;
  userCoordinates: Coordinates;
  correctCoordinates: Coordinates;
  distance: number;
  points: number;
}

export interface GameResult {
  mode: GameMode;
  totalScore: number;
  roundResults: RoundResult[];
  completedAt: string;
}

export interface GameState {
  gameId: string | null;
  mode: GameMode;
  isStarted: boolean;
  isSubmitted: boolean;
  isResultVisible: boolean;
  isLoading: boolean;
  score: number;
  lives: number;
  currentRound: number;
  maxRounds: number;
  userCoordinates: Coordinates | null;
  correctCoordinates: Coordinates | null;
  distance: number | null;
  points: number | null;
  gameResults: GameResult[];
  roundResults: RoundResult[];
}

export interface CoordinateState {
  xCoor: number | null;
  yCoor: number | null;
  xRightCoor: number | null;
  yRightCoor: number | null;
}

export interface PerformanceTracking {
  imageLoadedAt: number | null;
  firstMapClickRecorded: boolean;
  firstSubmitRecorded: boolean;
}
