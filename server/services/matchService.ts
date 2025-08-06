import { QueueItem } from '../types/player.js';
import { Match } from '../types/match.js';
import { gameStorage } from '../storage/gameState.js';
import { debugLog } from '../utils/debug.js';
import { generateSessionId, createMatchId } from '../utils/helpers.js';

export class MatchService {
  createMatch(socket: any): { sessionId: string; partnerId?: string; matchId?: string } {
    const sessionId = generateSessionId();
    const queueItem: QueueItem = { sessionId, socket, score: 0 };
    
    gameStorage.addToQueue(queueItem);
    
    const self = gameStorage.findInQueue(q => q.sessionId === sessionId);
    const other = gameStorage.findInQueue(q => q.sessionId !== sessionId && !q.partnerId);
    
    if (other && self) {
      const matchId = createMatchId(self.sessionId, other.sessionId);
      
      // Set up partnerships
      self.partnerId = other.sessionId;
      other.partnerId = self.sessionId;
      
      // Create match record
      const match: Match = {
        player1: self.sessionId,
        player2: other.sessionId,
        socket1: self.socket,
        socket2: other.socket,
        roundNumber: 1,
        player1Connected: false,
        player2Connected: false,
        player1Ready: false,
        player2Ready: false
      };
      
      gameStorage.addMatch(matchId, match);
      gameStorage.addPlayerSession(self.sessionId, { matchId, socket: self.socket });
      gameStorage.addPlayerSession(other.sessionId, { matchId, socket: other.socket });
      
      // Remove from queue and add to active players
      gameStorage.removeFromQueue(self.sessionId);
      gameStorage.removeFromQueue(other.sessionId);
      gameStorage.addActivePlayer(self.sessionId, self);
      gameStorage.addActivePlayer(other.sessionId, other);
      
      // Emit match events
      if (self.socket?.connected) {
        self.socket.emit("queueMatched", { 
          sessionId: self.sessionId, 
          partnerId: other.sessionId, 
          matchId 
        });
      }
      
      if (other.socket?.connected) {
        other.socket.emit("queueMatched", { 
          sessionId: other.sessionId, 
          partnerId: self.sessionId, 
          matchId 
        });
      }
      
      debugLog(`[MATCH] Match ${matchId} created, waiting for players to connect on versus page`);
      
      return { sessionId, partnerId: other.sessionId, matchId };
    }
    
    return { sessionId };
  }

  restoreSession(existingSessionId: string, socket: any): {
    success: boolean;
    sessionId?: string;
    matchId?: string;
    partnerId?: string;
    roundData?: any;
    gameState?: any;
    noRoundData?: boolean;
  } {
    debugLog(`[RESTORE] Attempting to restore session: ${existingSessionId}`);
    
    const sessionData = gameStorage.getPlayerSession(existingSessionId);
    
    if (sessionData) {
      const { matchId } = sessionData;
      const match = gameStorage.getMatch(matchId);
      
      if (match) {
        sessionData.socket = socket;
        gameStorage.addPlayerSession(existingSessionId, sessionData);
        
        // Update the socket reference in activeMatches and activePlayers
        if (match.player1 === existingSessionId) {
          match.socket1 = socket;
          const player = gameStorage.getActivePlayer(existingSessionId);
          if (player) player.socket = socket;
        } else if (match.player2 === existingSessionId) {
          match.socket2 = socket;
          const player = gameStorage.getActivePlayer(existingSessionId);
          if (player) player.socket = socket;
        }
        
        const roundData = gameStorage.getCurrentRound(matchId);
        const gameState = gameStorage.getGameState(matchId);
        const partnerId = match.player1 === existingSessionId ? match.player2 : match.player1;
        
        debugLog(`[RESTORE] Found round data for match ${matchId}:`, roundData ? 'Yes' : 'No');
        debugLog(`[RESTORE] Found game state for match ${matchId}:`, gameState ? 'Yes' : 'No');
        
        if (roundData) {
          debugLog(`[RESTORE] Sending round data to restored session ${existingSessionId}`);
          socket.emit('startRound', roundData);
          socket.emit("queueMatched", {
            sessionId: existingSessionId,
            partnerId,
            matchId,
            isReconnect: true
          });
          
          // Send game state if available
          if (gameState) {
            const playerState = gameState[existingSessionId];
            const partnerState = gameState[partnerId];
            
            if (playerState) {
              socket.emit('restoreGameState', {
                totalPoints: playerState.score || 0,
                partnerPoints: partnerState?.score || 0,
                hasSubmitted: playerState.hasSubmitted || false,
                opponentHasSubmitted: partnerState?.hasSubmitted || false
              });
            }
          }
          
          return { 
            success: true, 
            sessionId: existingSessionId, 
            matchId,
            partnerId,
            roundData,
            gameState: gameState ? gameState[existingSessionId] : null
          };
        } else {
          debugLog(`[RESTORE] No current round data for match ${matchId}`);
          socket.emit("queueMatched", {
            sessionId: existingSessionId,
            partnerId,
            matchId,
            isReconnect: true
          });
          
          return { 
            success: true, 
            sessionId: existingSessionId, 
            matchId,
            partnerId,
            noRoundData: true 
          };
        }
      } else {
        debugLog(`[RESTORE] No active match found for session ${existingSessionId}`);
      }
    } else {
      debugLog(`[RESTORE] No session data found for ${existingSessionId}`);
    }
    
    return { success: false };
  }
}

export const matchService = new MatchService();
