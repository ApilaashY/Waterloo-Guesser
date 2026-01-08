import { getDb } from "../lib/mongodb.js";

export class GameType {
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
  }) {
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
  static async generateNewGame(sessionId, player1Id, player2Id) {
    try {
      // Get a random image and its answer from the image pool
      const db = await getDb();
      const collection = db.collection("base_locations");
      // Fix: Only count approved images
      const count = await collection.countDocuments({ status: "approved" });

      if (count === 0) {
        console.log("[ROUND] No images found in the database");
        return undefined;
      }

      const randomSkip = Math.floor(Math.random() * count);
      const doc = await collection
        .find({ status: "approved" })
        .skip(randomSkip)
        .limit(1)
        .next();

      if (!doc) {
        console.log("[ROUND] Failed to fetch random image");
        return undefined;
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
    } catch (error) {
      console.error("[GAME] Error generating new game:", error);
      return undefined;
    }
  }

  // Method to filter the GameType data for the player 1 or 2 client
  filterForPlayer(data) {
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
        partnerStatus: this.player1Status,
      };
    }
  }

  nonFilterForPlayer(data) {
    return {
      ...this.filterForPlayer(data),
      answer: this.answer,
      partnerGuess: data.player1 ? this.player2Guess : this.player1Guess,
    };
  }

  async nextRound() {
    try {
      // Add the current image to previous images
      this.previousImages.push(this.imageUrl);

      // Get a random image and its answer from the image pool
      const db = await getDb();
      const collection = db.collection("base_locations");
      // Fix: Only count approved images
      const count = await collection.countDocuments({ status: "approved" });

      if (count === 0) {
        console.log("[ROUND] No images found in the database");
        return;
      }

      // Fix: Reset if exhausted
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

      console.log("[ROUND] Next round initialized:", this.currentRoundIndex);
    } catch (error) {
      console.error("[ROUND] Error in nextRound:", error);
    }
  }
}

export const PlayerStatus = {
  WAITING: "waiting",
  READY: "ready",
  ACTIVE: "active",
  INACTIVE: "inactive",
};
