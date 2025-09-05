import { QueueItem } from '../types/player.js';
import { RoundData, RoundLock } from '../types/round.js';
import { gameStorage } from '../storage/gameState.js';
import { debugLog } from '../utils/debug.js';
import { createMatchId } from '../utils/helpers.js';

export class GameService {
  async startNewRound(player1: QueueItem, player2: QueueItem): Promise<void> {
    const roundId = Date.now().toString();
    debugLog(`[ROUND] Starting new round ${roundId} for players ${player1.sessionId} and ${player2.sessionId}`);
    
    try {
      // Lock the round to prevent concurrent modifications
      const roundLock: RoundLock = { 
        isLocked: true, 
        roundData: null, 
        playersReady: new Set() 
      };
      gameStorage.addRoundLock(roundId, roundLock);

      // Fetch a random image
      const { getDb } = await import("../../lib/mongodb.ts");
      const db = await getDb();
      const collection = db.collection("base_locations");
      const count = await collection.countDocuments();
      
      if (count === 0) {
        debugLog('[ROUND] No images found in the database');
        return;
      }
      
      const randomSkip = Math.floor(Math.random() * count);
      const doc = await collection.find().skip(randomSkip).limit(1).next();
      
      if (!doc) {
        debugLog('[ROUND] Failed to fetch random image');
        return;
      }

      // Prepare round data
      const roundData: RoundData = {
        roundId,
        imageId: doc.image.toString(),
        correctX: doc.xCoordinate,
        correctY: doc.yCoordinate,
        timestamp: Date.now()
      };
      
      debugLog(`[ROUND] Selected image ${roundData.imageId} for round ${roundId}`);
      
      // Update round lock with the round data
      roundLock.roundData = roundData;
      
      // Store round data for session restoration
      const matchId = createMatchId(player1.sessionId, player2.sessionId);
      gameStorage.addCurrentRound(matchId, roundData);
      
      // Update player objects
      [player1, player2].forEach(player => {
        player.correctX = doc.xCoordinate;
        player.correctY = doc.yCoordinate;
        player.hasSubmitted = false;
      });

      // Function to check if both players are ready
      const checkAndStartRound = (playerId: string) => {
        if (!roundLock.roundData) return;
        roundLock.playersReady.add(playerId);
        
        if (roundLock.playersReady.size === 2) {
          debugLog(`[ROUND] Both players ready, starting round ${roundId}`);
          
          // Emit to both players
          [player1, player2].forEach(player => {
            if (player.socket?.connected) {
              debugLog(`[ROUND] Sending round data to player ${player.sessionId}`);
              player.socket.emit("startRound", roundLock.roundData);
            } else {
              debugLog(`[ROUND] Player ${player.sessionId} socket not connected`);
            }
          });
          
          // Clean up after a longer delay to allow for reconnections
          setTimeout(() => {
            gameStorage.removeRoundLock(roundId);
            const matchId = createMatchId(player1.sessionId, player2.sessionId);
            gameStorage.removeCurrentRound(matchId);
            debugLog(`[ROUND] Cleaned up round ${roundId} and match ${matchId} after timeout`);
          }, 300000); // 5 minutes
        }
      };

      // Check if players are already connected and ready
      let readyCount = 0;
      debugLog(`[ROUND] Checking player connections for round ${roundId}`);
      debugLog(`[ROUND] Player 1 (${player1.sessionId}) socket status: ${player1.socket ? 'exists' : 'null'}, connected: ${player1.socket?.connected || false}`);
      debugLog(`[ROUND] Player 2 (${player2.sessionId}) socket status: ${player2.socket ? 'exists' : 'null'}, connected: ${player2.socket?.connected || false}`);
      
      if (player1.socket?.connected) {
        checkAndStartRound(player1.sessionId);
        readyCount++;
      } else {
        debugLog(`[ROUND] Player 1 (${player1.sessionId}) socket not connected`);
      }
      
      if (player2.socket?.connected) {
        checkAndStartRound(player2.sessionId);
        readyCount++;
      } else {
        debugLog(`[ROUND] Player 2 (${player2.sessionId}) socket not connected`);
      }
      
      // If both players are connected, the round should start immediately
      if (readyCount === 2) {
        debugLog(`[ROUND] Both players connected, round ${roundId} should start automatically`);
      }
    } catch (err) {
      debugLog(`[ROUND] Error in round ${roundId}:`, err);
      
      // Clean up on error
      gameStorage.removeRoundLock(roundId);
      
      // Notify players of the error
      [player1, player2].forEach(player => {
        if (player.socket?.connected) {
          player.socket.emit("roundError", { message: "Failed to start round. Please try again." });
        }
      });
    }
  }

  async restartSession(sessionId: string, partnerId: string): Promise<void> {
    debugLog(`[RESTART] Restarting session for ${sessionId} and ${partnerId}`);
    
    const player1 = gameStorage.getActivePlayer(sessionId);
    const player2 = gameStorage.getActivePlayer(partnerId);
    
    if (player1 && player2) {
      // Reset scores and submission state
      player1.score = 0;
      player2.score = 0;
      player1.hasSubmitted = false;
      player2.hasSubmitted = false;
      
      // Remove any stored game state
      const matchId = createMatchId(sessionId, partnerId);
      gameStorage.removeGameState(matchId);
      
      // Start a new round
      await this.startNewRound(player1, player2);
    } else {
      debugLog(`[RESTART] Could not find both players for restart: ${sessionId}, ${partnerId}`);
    }
  }
}

export const gameService = new GameService();
