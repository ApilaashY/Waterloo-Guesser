export interface RoundData {
  roundId: string;
  imageId: string;
  correctX: number;
  correctY: number;
  timestamp: number;
}

export interface RoundLock {
  isLocked: boolean;
  roundData: RoundData | null;
  playersReady: Set<string>;
}
