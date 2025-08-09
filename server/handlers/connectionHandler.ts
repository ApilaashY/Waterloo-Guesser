import { gameStorage } from '../storage/gameState.js';
import { gameService } from '../services/gameService.js';
import { debugLog } from '../utils/debug.js';

export function handleConnection(socket: any, io: any) {
  debugLog(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on("error", (error: any) => {
    debugLog(`[SOCKET] Error from ${socket.id}:`, error);
  });

  // Handle client identifying themselves with their session ID
  socket.on("identify", (sessionId: string) => {
    debugLog(`[SOCKET] Client ${socket.id} identified as session ${sessionId}`);
    
    const player = gameStorage.getActivePlayer(sessionId);
    if (player) {
      player.socket = socket;
      debugLog(`[SOCKET] Updated socket for active player ${sessionId}`);
      
      // Update socket in playerSessions as well
      const sessionData = gameStorage.getPlayerSession(sessionId);
      if (sessionData) {
        sessionData.socket = socket;
      }
      
      // Update socket in activeMatches and mark player as connected
      for (const [matchId, match] of gameStorage.activeMatches.entries()) {
        if (match.player1 === sessionId) {
          match.socket1 = socket;
          match.player1Ready = true;
          debugLog(`[SOCKET] Player 1 (${sessionId}) is ready for match ${matchId}`);
        } else if (match.player2 === sessionId) {
          match.socket2 = socket;
          match.player2Ready = true;
          debugLog(`[SOCKET] Player 2 (${sessionId}) is ready for match ${matchId}`);
        }
        
        // Check if both players are now ready
        if (match.player1Ready && match.player2Ready) {
          debugLog(`[SOCKET] Both players are ready for match ${matchId}, starting round`);
          
          // Check if this is a new match that hasn't started yet
          if (!gameStorage.getCurrentRound(matchId)) {
            const player1 = gameStorage.getActivePlayer(match.player1);
            const player2 = gameStorage.getActivePlayer(match.player2);
            if (player1 && player2) {
              gameService.startNewRound(player1, player2);
            }
          } else {
            debugLog(`[SOCKET] Match ${matchId} already has a round in progress`);
          }
        }
      }
    } else {
      debugLog(`[SOCKET] No active player found for session ${sessionId}`);
    }
  });

  // Handle reconnection with existing session
  socket.on('reconnect', (attemptNumber: number) => {
    debugLog(`[SOCKET] Client reconnected: ${socket.id} (attempt ${attemptNumber})`);
    
    // Find the player's session
    for (const [sessionId, player] of gameStorage.activePlayers.entries()) {
      if (player.socket && player.socket.id === socket.id) {
        // Update socket reference
        player.socket = socket;
        debugLog(`[SOCKET] Updated socket for session ${sessionId}`);
        
        // If there's a partner, request to resend the current round
        if (player.partnerId && gameStorage.getActivePlayer(player.partnerId)) {
          const partner = gameStorage.getActivePlayer(player.partnerId);
          if (partner?.socket?.connected) {
            debugLog(`[SOCKET] Requesting partner to resend round data`);
            partner.socket.emit('resendRoundData', { sessionId: player.sessionId });
          }
        }
        break;
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason: string) => {
    debugLog(`[SOCKET] Client disconnected: ${socket.id} (${reason})`);
    
    let removed = false;
    let sessionIdToRemove: string | null = null;
    
    for (const [sessionId, player] of gameStorage.activePlayers.entries()) {
      if (player.socket && player.socket.id === socket.id) {
        player.socket = null;
        sessionIdToRemove = sessionId;
        break;
      }
    }
    
    if (sessionIdToRemove) {
      const sessionData = gameStorage.getPlayerSession(sessionIdToRemove);
      if (sessionData) {
        debugLog(`[SOCKET] Session ${sessionIdToRemove} is part of match ${sessionData.matchId}`);
      }
    }
    
    for (let i = gameStorage.queue.length - 1; i >= 0; i--) {
      if (gameStorage.queue[i].socket && gameStorage.queue[i].socket.id === socket.id) {
        const queuedPlayer = gameStorage.queue[i];
        const sessionData = gameStorage.getPlayerSession(queuedPlayer.sessionId);
        if (!sessionData || !sessionData.matchId) {
          gameStorage.queue.splice(i, 1);
          removed = true;
        }
      }
    }
    
    debugLog(`[SOCKET] Client disconnected. Socket ID: ${socket.id}. Removed from queue: ${removed}`);
    debugLog("[SOCKET] Queue after disconnect:", gameStorage.queue.map(q => ({ sessionId: q.sessionId, partnerId: q.partnerId })));
    debugLog("[SOCKET] ActivePlayers after disconnect:", Array.from(gameStorage.activePlayers.keys()));
  });

  // TEMP: Restart session for debugging
  socket.on('restartSession', async ({ sessionId, partnerId }: { sessionId: string, partnerId: string }) => {
    await gameService.restartSession(sessionId, partnerId);
  });
}
