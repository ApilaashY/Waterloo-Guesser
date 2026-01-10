import { getDb } from "../../lib/mongodb.js";

export interface FilteredClientGameType {
  sessionId: string;
  id: string;
  partnerId: string;
  currentRoundIndex: number;
  points: number;
  partnerPoints: number;
  imageUrl: string;
  guess: { x: number; y: number } | null;
  status: PlayerStatus;
  partnerStatus: PlayerStatus;
  timedMode?: boolean;
  roundStartTime?: number;
  opponentSubmitTime?: number | null;
}

export interface UnfilteredClientGameType extends FilteredClientGameType {
  answer: { x: number; y: number };
  partnerGuess: { x: number; y: number } | null;
}

interface GameTypeProps {
  sessionId: string;
  player1Id: string;
  player2Id: string;
  currentRoundIndex: number;
  player1Points: number;
  player2Points: number;
  imageUrl: string;
  answer: { x: number; y: number };
  player1Guess: { x: number; y: number } | null;
  player2Guess: { x: number; y: number } | null;
  player1Status: PlayerStatus;
  player2Status: PlayerStatus;
  started: boolean;
  previousImages: string[];
  imageId: string;
  timedMode?: boolean;
  roundStartTime?: number;
  player1SubmitTime?: number | null;
  player2SubmitTime?: number | null;
}

export class GameType {
  sessionId: string;
  player1Id: string;
  player2Id: string;
  currentRoundIndex: number;
  player1Points: number;
  player2Points: number;
  imageUrl: string;
  answer: { x: number; y: number };
  player1Guess: { x: number; y: number } | null;
  player2Guess: { x: number; y: number } | null;
  player1Status: PlayerStatus;
  player2Status: PlayerStatus;
  started: boolean;
  previousImages: string[];
  imageId: string;
  timedMode: boolean;
  roundStartTime: number;
  player1SubmitTime: number | null;
  player2SubmitTime: number | null;

  // Constructor to initialize the GameType object
  constructor({
    sessionId,
    player1Id,
    player2Id,
    currentRoundIndex,
    player1Points,
    player2Points,
    imageUrl,
    answer,
    player1Guess,
    player2Guess,
    player1Status,
    player2Status,
    started,
    previousImages,
    imageId,
    timedMode = false,
    roundStartTime = Date.now(),
    player1SubmitTime = null,
    player2SubmitTime = null,
  }: GameTypeProps) {
    this.sessionId = sessionId;
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    this.currentRoundIndex = currentRoundIndex;
    this.player1Points = player1Points;
    this.player2Points = player2Points;
    this.imageUrl = imageUrl;
    this.answer = answer;
    this.player1Guess = player1Guess;
    this.player2Guess = player2Guess;
    this.player1Status = player1Status;
    this.player2Status = player2Status;
    this.started = started;
    this.previousImages = previousImages;
    this.imageId = imageId;
    this.timedMode = timedMode;
    this.roundStartTime = roundStartTime;
    this.player1SubmitTime = player1SubmitTime;
    this.player2SubmitTime = player2SubmitTime;
  }

  // Static method to generate new Game of GameType
  static async generateNewGame(
    sessionId: string,
    player1Id: string,
    player2Id: string,
    timedMode: boolean = false
  ): Promise<GameType | undefined> {
    // Get a random image and its answer from the image pool
    const db = await getDb();
    const collection = db.collection("base_locations");
    const count = await collection.countDocuments();

    if (count === 0) {
      console.log("[ROUND] No images found in the database");
      return;
    }

    const randomSkip = Math.floor(Math.random() * count);
    const doc = await collection
      .find({ status: "approved" })
      .skip(randomSkip)
      .limit(1)
      .next();

    if (!doc) {
      console.log("[ROUND] Failed to fetch random image");
      return;
    }

    return new GameType({
      sessionId,
      player1Id,
      player2Id,
      currentRoundIndex: 0,
      player1Points: 0,
      player2Points: 0,
      imageUrl: doc.image.toString(),
      answer: { x: doc.xCoordinate, y: doc.yCoordinate },
      player1Guess: null,
      player2Guess: null,
      player1Status: PlayerStatus.WAITING,
      player2Status: PlayerStatus.WAITING,
      started: false,
      previousImages: [],
      imageId: doc._id.toString(),
      timedMode,
      roundStartTime: Date.now(),
      player1SubmitTime: null,
      player2SubmitTime: null,
    });
  }

  // Method to filter the GameType data for the player 1 or 2 client
  filterForPlayer(data: { player1: boolean }): FilteredClientGameType {
    if (data.player1) {
      return {
        sessionId: this.sessionId,
        id: this.player1Id,
        partnerId: this.player2Id,
        currentRoundIndex: this.currentRoundIndex,
        points: this.player1Points,
        partnerPoints: this.player2Points,
        imageUrl: this.imageUrl,
        guess: this.player1Guess,
        status: this.player1Status,
        partnerStatus: this.player2Status,
        timedMode: this.timedMode,
        roundStartTime: this.roundStartTime,
        opponentSubmitTime: this.player2SubmitTime,
      };
    } else {
      return {
        sessionId: this.sessionId,
        id: this.player2Id,
        partnerId: this.player1Id,
        currentRoundIndex: this.currentRoundIndex,
        points: this.player2Points,
        partnerPoints: this.player1Points,
        imageUrl: this.imageUrl,
        guess: this.player2Guess,
        status: this.player2Status,
        partnerStatus: this.player1Status,
        timedMode: this.timedMode,
        roundStartTime: this.roundStartTime,
        opponentSubmitTime: this.player1SubmitTime,
      };
    }
  }

  nonFilterForPlayer(data: { player1: boolean }): UnfilteredClientGameType {
    return {
      ...this.filterForPlayer(data),
      answer: this.answer,
      partnerGuess: data.player1 ? this.player2Guess : this.player1Guess,
    };
  }

  async nextRound() {
    // Add the curent image to previous images
    this.previousImages.push(this.imageUrl);

    // Get a random image and its answer from the image pool
    const db = await getDb();
    const collection = db.collection("base_locations");
    // Fix: Only count approved images to ensure skip logic is correct
    const count = await collection.countDocuments({ status: "approved" });

    if (count === 0) {
      console.log("[ROUND] No images found in the database");
      return;
    }

    // Fix: If we've used all available images, reset the history to allow reuse
    if (this.previousImages.length >= count) {
      console.log("[ROUND] All images used. Resetting previousImages to allow reuse.");
      this.previousImages = [];
    }

    // Find a new image that hasn't been used in previous rounds
    let doc;
    let attempts = 0;

    // Try to find a unique image, but verify we don't loop forever
    do {
      attempts++;
      const randomSkip = Math.floor(Math.random() * count);
      doc = await collection
        .find({ status: "approved" })
        .skip(randomSkip)
        .limit(1)
        .next();

      // Safety break to prevent infinite loops even if logic seems sound
      if (attempts > 20) {
        console.log("[ROUND] Could not find unique image after 20 attempts. Using current selection.");
        break;
      }
    } while (doc && this.previousImages.includes(doc.image.toString()));

    if (!doc) {
      console.log("[ROUND] Failed to fetch random image, trying to fetch first available.");
      doc = await collection.find({ status: "approved" }).limit(1).next();

      if (!doc) {
        console.log("[ROUND] No approved images available at all.");
        return;
      }
    }

    // Update game information
    this.currentRoundIndex += 1;
    this.player1Guess = null;
    this.player2Guess = null;
    this.imageUrl = doc.image.toString();
    this.answer = { x: doc.xCoordinate, y: doc.yCoordinate };
    // Reset timing for new round
    this.roundStartTime = Date.now();
    this.player1SubmitTime = null;
    this.player2SubmitTime = null;
    this.imageId = doc._id.toString();

    console.log(this);
  }

  // Rematch and Spectator specific properties
  rematchRequested: { player1: boolean; player2: boolean } = {
    player1: false,
    player2: false,
  };
  roomCloseTimeout: NodeJS.Timeout | null = null;
  spectatorIds: string[] = [];

  // Methods
  clearRoomCloseTimeout() {
    if (this.roomCloseTimeout) {
      clearTimeout(this.roomCloseTimeout);
      this.roomCloseTimeout = null;
    }
  }

  async resetForRematch(): Promise<void> {
    this.currentRoundIndex = 0;
    this.player1Points = 0;
    this.player2Points = 0;
    this.player1Guess = null;
    this.player2Guess = null;
    this.player1Status = PlayerStatus.WAITING;
    this.player2Status = PlayerStatus.WAITING;
    this.rematchRequested = { player1: false, player2: false };
    this.previousImages = [];
    // Reset timing for rematch
    this.roundStartTime = Date.now();
    this.player1SubmitTime = null;
    this.player2SubmitTime = null;

    // Get a new image for the first round
    const db = await getDb();
    const collection = db.collection("base_locations");
    const count = await collection.countDocuments({ status: "approved" });

    if (count > 0) {
      const randomSkip = Math.floor(Math.random() * count);
      const doc = await collection
        .find({ status: "approved" })
        .skip(randomSkip)
        .limit(1)
        .next();

      if (doc) {
        this.imageUrl = doc.image.toString();
        this.answer = { x: doc.xCoordinate, y: doc.yCoordinate };
      }
    }
  }

  addSpectator(socketId: string) {
    if (!this.spectatorIds.includes(socketId)) {
      this.spectatorIds.push(socketId);
    }
  }

  removeSpectator(socketId: string) {
    this.spectatorIds = this.spectatorIds.filter((id) => id !== socketId);
  }

  getSpectatorView(): SpectatorGameView {
    return {
      sessionId: this.sessionId,
      player1Id: this.player1Id,
      player2Id: this.player2Id,
      currentRoundIndex: this.currentRoundIndex,
      player1Points: this.player1Points,
      player2Points: this.player2Points,
      imageUrl: this.imageUrl,
      player1Status: this.player1Status,
      player2Status: this.player2Status,
      player1Guess: this.player1Guess,
      player2Guess: this.player2Guess,
      answer: this.answer,
    };
  }

  getMatchSummary(): MatchSummary {
    return {
      sessionId: this.sessionId,
      player1Id: this.player1Id,
      player2Id: this.player2Id,
      currentRoundIndex: this.currentRoundIndex,
      started: this.started,
    };
  }
}

export interface SpectatorGameView {
  sessionId: string;
  player1Id: string;
  player2Id: string;
  currentRoundIndex: number;
  player1Points: number;
  player2Points: number;
  imageUrl: string;
  player1Status: PlayerStatus;
  player2Status: PlayerStatus;
  player1Guess: { x: number; y: number } | null;
  player2Guess: { x: number; y: number } | null;
  answer: { x: number; y: number };
}

export interface MatchSummary {
  sessionId: string;
  player1Id: string;
  player2Id: string;
  currentRoundIndex: number;
  started: boolean;
}

export enum PlayerStatus {
  WAITING = "waiting",
  READY = "ready",
  ACTIVE = "active",
  INACTIVE = "inactive",
}
