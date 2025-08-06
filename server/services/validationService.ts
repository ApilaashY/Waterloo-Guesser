import { gameStorage } from '../storage/gameState.js';
import { gameService } from './gameService.js';
import { debugLog } from '../utils/debug.js';
import { createMatchId, calculateDistance, calculatePoints } from '../utils/helpers.js';

export class ValidationService {
  async validateCoordinates(
    x: number, 
    y: number, 
    sessionId: string, 
    partnerId: string, 
    socket: any
  ): Promise<{
    success: boolean;
    points?: number;
    totalPoints?: number;
    roundComplete?: boolean;
    valid?: boolean;
    error?: string;
  }> {
    debugLog(`[VALIDATION] Player ${sessionId} submitted coordinates: x=${x}, y=${y}`);
    
    const currentPlayer = gameStorage.getActivePlayer(sessionId);
    const partner = gameStorage.getActivePlayer(partnerId);
    
    if (!partner || !currentPlayer) {
      debugLog(`[VALIDATION] Partner or current player not found`);
      return { success: false, error: 'Partner not found' };
    }
    
    const correctX = currentPlayer.correctX;
    const correctY = currentPlayer.correctY;
    
    if (correctX === undefined || correctY === undefined) {
      debugLog(`[VALIDATION] Correct coordinates not available for player ${sessionId}`);
      debugLog(`[VALIDATION] currentPlayer.correctX: ${correctX}, currentPlayer.correctY: ${correctY}`);
      return { success: false, error: 'Correct coordinates not available' };
    }
    
    debugLog(`[VALIDATION] Correct coordinates: x=${correctX}, y=${correctY}`);
    debugLog(`[VALIDATION] Player coordinates: x=${x}, y=${y}`);
    
    const distance = calculateDistance(x, y, correctX, correctY);
    debugLog(`[VALIDATION] Distance: ${distance}`);
    
    const threshold = 0.1;
    const isValid = distance <= threshold;
    const points = calculatePoints(distance, threshold);
    
    debugLog(`[VALIDATION] Threshold: ${threshold}, Valid: ${isValid}, Points: ${points}`);
    
    currentPlayer.score = (currentPlayer.score || 0) + points;
    currentPlayer.hasSubmitted = true;
    
    // Store game state for session persistence
    const matchId = createMatchId(sessionId, partnerId);
    gameStorage.updateGameState(matchId, sessionId, {
      score: currentPlayer.score,
      hasSubmitted: currentPlayer.hasSubmitted
    });
    gameStorage.updateGameState(matchId, partnerId, {
      score: partner.score || 0,
      hasSubmitted: partner.hasSubmitted || false
    });
    
    socket.emit('validationResult', { 
      valid: isValid, 
      points,
      totalPoints: currentPlayer.score,
      correctX,
      correctY,
      roundComplete: false
    });
    
    if (partner.hasSubmitted) {
      const partnerScore = partner.score || 0;
      const currentPlayerScore = currentPlayer.score || 0;
      
      // Reset submission states for next round
      currentPlayer.hasSubmitted = false;
      partner.hasSubmitted = false;
      
      // Update game state for round completion
      gameStorage.updateGameState(matchId, sessionId, {
        score: currentPlayerScore,
        hasSubmitted: false
      });
      gameStorage.updateGameState(matchId, partnerId, {
        score: partnerScore,
        hasSubmitted: false
      });
      
      socket.emit('validationResult', {
        valid: isValid,
        points,
        totalPoints: currentPlayerScore,
        opponentPoints: partnerScore,
        correctX,
        correctY,
        roundComplete: true
      });
      
      if (partner.socket && partner.socket.connected) {
        const partnerValidation = {
          valid: false,
          points: 0,
          totalPoints: partnerScore,
          opponentPoints: currentPlayerScore,
          correctX: partner.correctX,
          correctY: partner.correctY,
          roundComplete: true
        };
        partner.socket.emit('validationResult', partnerValidation);
      }
      
      // Start new round after delay
      setTimeout(() => {
        const updatedCurrentPlayer = gameStorage.getActivePlayer(sessionId);
        const updatedPartner = gameStorage.getActivePlayer(partnerId);
        
        if (updatedCurrentPlayer && updatedPartner) {
          gameService.startNewRound(updatedCurrentPlayer, updatedPartner);
        } else {
          debugLog(`[VALIDATION] Could not find active players for next round: ${sessionId}, ${partnerId}`);
        }
      }, 3000);
      
      return { 
        success: true, 
        points,
        totalPoints: currentPlayer.score,
        roundComplete: true,
        valid: isValid
      };
    } else {
      if (partner.socket && partner.socket.connected) {
        partner.socket.emit('opponentSubmitted', { 
          sessionId: currentPlayer.sessionId,
          points: currentPlayer.score
        });
      }
      
      return { 
        success: true, 
        points,
        totalPoints: currentPlayer.score,
        roundComplete: false,
        valid: isValid
      };
    }
  }
}

export const validationService = new ValidationService();
