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
  }

  // Static method to generate new Game of GameType
  static async generateNewGame(
    sessionId: string,
    player1Id: string,
    player2Id: string
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
    const doc = await collection.find().skip(randomSkip).limit(1).next();

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
    const count = await collection.countDocuments();

    if (count === 0) {
      console.log("[ROUND] No images found in the database");
      return;
    }

    // Find a new image that hasn't been used in previous rounds
    let doc;
    do {
      const randomSkip = Math.floor(Math.random() * count);
      doc = await collection.find().skip(randomSkip).limit(1).next();
    } while (this.previousImages.includes(doc?.image.toString() || ""));

    if (!doc) {
      console.log("[ROUND] Failed to fetch random image");
      return;
    }

    // Update game information
    this.currentRoundIndex += 1;
    this.player1Guess = null;
    this.player2Guess = null;
    this.imageUrl = doc.image.toString();
    this.answer = { x: doc.xCoordinate, y: doc.yCoordinate };

    console.log(this);
  }
}

export enum PlayerStatus {
  WAITING = "waiting",
  ACTIVE = "active",
  INACTIVE = "inactive",
}
