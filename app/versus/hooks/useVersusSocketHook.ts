import { useCallback, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, RoundData, ValidationResult } from '../types';

interface UseVersusSocketProps {
  socket: Socket | null;
  sessionId: string | null;
  partnerId: string | null;
  state: GameState;
  setToast: (toast: string | null) => void;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
  setHasSubmitted: (hasSubmitted: boolean) => void;
  setOpponentHasSubmitted: (hasSubmitted: boolean) => void;
  setIsRoundComplete: (complete: boolean) => void;
  setXCoor: (x: number | null) => void;
  setYCoor: (y: number | null) => void;
  setXRightCoor: (x: number | null) => void;
  setYRightCoor: (y: number | null) => void;
  setTotalPoints: (points: number) => void;
  setPartnerPoints: (points: number) => void;
  setShowResult: (show: boolean) => void;
}

export function useVersusSocket({
  socket,
  sessionId,
  partnerId,
  state,
  setToast,
  setState,
  setHasSubmitted,
  setOpponentHasSubmitted,
  setIsRoundComplete,
  setXCoor,
  setYCoor,
  setXRightCoor,
  setYRightCoor,
  setTotalPoints,
  setPartnerPoints,
  setShowResult,
}: UseVersusSocketProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoundId = useRef<string | null>(null);

  // Request current round data if we don't have it
  const requestCurrentRound = useCallback(() => {
    if (!socket || !sessionId || !partnerId) return;
    
    console.log('[Versus] Requesting current round data...');
    socket.emit('requestCurrentRound', { sessionId, partnerId }, (response: any) => {
      if (response?.success && response?.roundData) {
        console.log('[Versus] Received current round data:', response.roundData);
        setState(prevState => ({
          ...prevState,
          image: response.roundData.imageId,
          correctX: response.roundData.correctX ?? response.roundData.xCoor ?? response.roundData.x ?? null,
          correctY: response.roundData.correctY ?? response.roundData.yCoor ?? response.roundData.y ?? null,
        }));
      } else {
        console.log('[Versus] No current round data available:', response);
      }
    });
  }, [socket, sessionId, partnerId, setState]);

  // Handle start of a new round
  const handleStartRound = useCallback((data: any) => {
    console.log("[Versus] Starting new round with data:", data);
    if (!data || !data.imageId) {
      console.error("[Versus] Invalid round data received:", data);
      setToast('Error: Invalid game data received. Please try again.');
      return;
    }
    
    try {
      currentRoundId.current = data.roundId || Date.now().toString();
      
      setState(prevState => ({
        ...prevState,
        image: data.imageId,
        correctX: data.correctX ?? data.xCoor ?? data.x ?? null,
        correctY: data.correctY ?? data.yCoor ?? data.y ?? null,
      }));
      
      // Reset round-specific state
      setHasSubmitted(false);
      setOpponentHasSubmitted(false);
      setIsRoundComplete(false);
      setXCoor(null);
      setYCoor(null);
      setXRightCoor(null);
      setYRightCoor(null);
      setShowResult(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      console.log(`[Versus] Round ${currentRoundId.current} started with image ${data.imageId}`);
    } catch (error) {
      console.error('[Versus] Error in handleStartRound:', error);
      setToast('An error occurred while starting the round. Please try again.');
    }
  }, [setState, setHasSubmitted, setOpponentHasSubmitted, setIsRoundComplete, setXCoor, setYCoor, setToast]);

  const handleRoundError = useCallback((error: { message: string }) => {
    console.error('[Versus] Round error:', error);
    setToast(error.message || 'An error occurred during the round. Please try again.');
  }, [setToast]);

  const handleGameStateRestore = useCallback((data: {
    totalPoints: number;
    partnerPoints: number;
    hasSubmitted: boolean;
    opponentHasSubmitted: boolean;
  }) => {
    console.log('[Versus] Restoring game state:', data);
    setTotalPoints(data.totalPoints);
    setPartnerPoints(data.partnerPoints);
    setHasSubmitted(data.hasSubmitted);
    setOpponentHasSubmitted(data.opponentHasSubmitted);
  }, [setTotalPoints, setPartnerPoints, setHasSubmitted, setOpponentHasSubmitted]);

  const handleOpponentSubmitted = useCallback((data: any) => {
    console.log('[Versus] Opponent submitted:', data);
    setOpponentHasSubmitted(true);
    setPartnerPoints(data.points || 0);
  }, [setOpponentHasSubmitted, setPartnerPoints]);

  const handleValidationResult = useCallback((data: ValidationResult) => {
    console.log('[Versus] Validation result:', data);
    
    const { valid, points, totalPoints: newTotalPoints, correctX, correctY, roundComplete, opponentPoints } = data;
    
    setTotalPoints(newTotalPoints);
    
    if (typeof opponentPoints === 'number') {
      setPartnerPoints(opponentPoints);
    }
    
    if (valid) {
      setXRightCoor(correctX);
      setYRightCoor(correctY);
    }
    
    if (roundComplete) {
      setIsRoundComplete(true);
    }
    setHasSubmitted(true);
    setShowResult(true);
  }, [setTotalPoints, setPartnerPoints, setXRightCoor, setYRightCoor, setIsRoundComplete, setHasSubmitted, setShowResult]);

  // Connection handlers
  const onConnect = useCallback(() => {
    console.log("[Versus] Socket.io connected");
    setToast(null);
    
    if (sessionId) {
      console.log(`[Versus] Restoring session: ${sessionId}`);
      socket?.emit('restoreSession', sessionId, (response: any) => {
        if (response?.success) {
          console.log('[Versus] Session restored successfully:', response);
          
          if (response.roundData) {
            console.log('[Versus] Restored round data:', response.roundData);
            setState(prevState => ({
              ...prevState,
              image: response.roundData.imageId,
              correctX: response.roundData.correctX,
              correctY: response.roundData.correctY
            }));
          } else if (response.noRoundData) {
            console.log('[Versus] Session restored but no current round data');
            // Request current round after a short delay
            setTimeout(() => {
              requestCurrentRound();
            }, 1000);
          }
        } else {
          console.error('[Versus] Failed to restore session:', response);
          setToast('Failed to restore game session. Please try again.');
          // Still try to request current round as fallback
          setTimeout(() => {
            requestCurrentRound();
          }, 1000);
        }
      });
    }
  }, [sessionId, socket, requestCurrentRound, setToast, setState]);

  const onDisconnect = useCallback(() => {
    console.log("[Versus] Socket.io disconnected");
    setToast('Disconnected from server. Attempting to reconnect...');
  }, [setToast]);

  const onConnectError = useCallback((error: Error) => {
    console.error("[Versus] Socket.io connection error:", error);
    setToast(`Connection error: ${error.message}`);
  }, [setToast]);

  const onReconnectAttempt = useCallback((attemptNumber: number) => {
    console.log(`[Versus] Reconnect attempt ${attemptNumber}`);
    setToast(`Attempting to reconnect (${attemptNumber})...`);
  }, [setToast]);

  const onReconnectError = useCallback((error: Error) => {
    console.error("[Versus] Socket.io reconnection error:", error);
    setToast(`Reconnection failed: ${error.message}`);
  }, [setToast]);

  // Socket event setup
  useEffect(() => {
    if (!socket || !sessionId) {
      console.log('[Versus] Socket or sessionId not available, waiting...');
      return;
    }

    console.log(`[Versus] Identifying session ${sessionId} to the server.`);
    socket.emit('identify', sessionId);

    console.log("[Versus] Setting up socket event listeners");

    // Connection events
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_error', onReconnectError);

    // Game events
    socket.on('startRound', handleStartRound);
    socket.on('validationResult', handleValidationResult);
    socket.on('roundComplete', () => {
      console.log('[Versus] Round complete');
      setIsRoundComplete(true);
      setHasSubmitted(false);
    });
    socket.on('opponentSubmitted', handleOpponentSubmitted);
    socket.on('roundError', handleRoundError);
    socket.on('restoreGameState', handleGameStateRestore);
    // Listen for points relay from partner
    socket.on('points', (data: { points: number }) => {
      console.log('[Versus] Received partner points:', data);
      setPartnerPoints(data.points || 0);
    });

    // Request current round data if we don't have it after a short delay
    const requestTimer = setTimeout(() => {
      if (!state.image) {
        console.log('[Versus] No image after delay, requesting current round...');
        requestCurrentRound();
      }
    }, 2000);

    return () => {
      console.debug('[useEffect] Cleaning up...');
      
      // Remove event listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect_error', onReconnectError);
      socket.off('startRound', handleStartRound);
      socket.off('validationResult', handleValidationResult);
      socket.off('roundComplete');
      socket.off('opponentSubmitted', handleOpponentSubmitted);
      socket.off('roundError', handleRoundError);
      socket.off('restoreGameState', handleGameStateRestore);
      socket.off('points');
      
      clearTimeout(requestTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    socket,
    sessionId,
    state.image,
    requestCurrentRound,
    onConnect,
    onDisconnect,
    onConnectError,
    onReconnectAttempt,
    onReconnectError,
    handleStartRound,
    handleValidationResult,
    handleOpponentSubmitted,
    handleRoundError,
    handleGameStateRestore,
    setIsRoundComplete,
    setHasSubmitted
  ]);

  return {
    requestCurrentRound,
    currentRoundId: currentRoundId.current,
  };
}
