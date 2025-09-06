import { gameStorage } from '../storage/gameState.js';
import { debugLog } from '../utils/debug.js';
import { createMatchId } from '../utils/helpers.js';

export function handleGame(socket: any) {
  // Handle requests for current round data
  socket.on("requestCurrentRound", ({ sessionId, partnerId }: { sessionId: string, partnerId: string }, callback: any) => {
    debugLog(`[ROUND_REQUEST] Player ${sessionId} requesting current round data`);
    
    const matchId = createMatchId(sessionId, partnerId);
    const roundData = gameStorage.getCurrentRound(matchId);
    
    if (roundData) {
      debugLog(`[ROUND_REQUEST] Sending current round data to ${sessionId}`);
      if (callback) callback({ 
        success: true, 
        roundData 
      });
    } else {
      debugLog(`[ROUND_REQUEST] No current round data found for match ${matchId}`);
      if (callback) callback({ 
        success: false, 
        error: 'No current round data available' 
      });
    }
  });

  // Handle coordinate updates from client
  socket.on("updateCoordinates", ({ sessionId, correctX, correctY }: { sessionId: string, correctX: number, correctY: number }) => {
    debugLog(`[COORDINATES] Client ${socket.id} updating coordinates for session ${sessionId}: x=${correctX}, y=${correctY}`);
    
    const player = gameStorage.getActivePlayer(sessionId);
    if (player) {
      player.correctX = correctX;
      player.correctY = correctY;
      debugLog(`[COORDINATES] Updated coordinates for player ${sessionId}`);
    } else {
      debugLog(`[COORDINATES] Player ${sessionId} not found in activePlayers`);
    }
  });

  // Points relay between players
  socket.on("points", (msg: any, callback: any) => {
    const partner = gameStorage.findInQueue(q => q.sessionId === msg.partnerId);
    if (partner && partner.socket?.connected) {
      partner.socket.emit("points", {
        points: msg.points,
        sessionId: msg.sessionId,
        partnerId: msg.partnerId
      });
    }
    if (callback) callback({ status: "received" });
  });

  // Explicit join event
  socket.on("join", ({ sessionId, partnerId }: { sessionId: string, partnerId: string }, callback: any) => {
    debugLog(`[SOCKET] join: sessionId=${sessionId}, partnerId=${partnerId}`);
    if (callback) callback({ status: "joined" });
  });
}
