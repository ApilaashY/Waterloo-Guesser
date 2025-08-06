import { useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '../types';

interface UseGameActionsProps {
  socket: Socket | null;
  sessionId: string | null;
  partnerId: string | null;
  state: GameState;
  xCoor: number | null;
  yCoor: number | null;
  hasSubmitted: boolean;
  setHasSubmitted: (hasSubmitted: boolean) => void;
  setTotalPoints: (setter: (prev: number) => number) => void;
  setQuestionCount: (setter: (prev: number) => number) => void;
  setXRightCoor: (x: number | null) => void;
  setYRightCoor: (y: number | null) => void;
  zoomToGuessAndAnswer: () => void;
}

export function useGameActions({
  socket,
  sessionId,
  partnerId,
  state,
  xCoor,
  yCoor,
  hasSubmitted,
  setHasSubmitted,
  setTotalPoints,
  setQuestionCount,
  setXRightCoor,
  setYRightCoor,
  zoomToGuessAndAnswer,
}: UseGameActionsProps) {
  const validatingCoordinate = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (!socket?.connected || !sessionId || !partnerId || hasSubmitted || xCoor === null || yCoor === null) {
      console.log('Cannot submit:', { 
        hasSocket: !!socket, 
        isConnected: socket?.connected, 
        hasSessionId: !!sessionId, 
        hasPartnerId: !!partnerId, 
        hasSubmitted,
        hasCoordinates: xCoor !== null && yCoor !== null
      });
      return;
    }

    console.log('Submitting coordinates:', { xCoor, yCoor, sessionId, partnerId });
    setHasSubmitted(true);
    
    try {
      socket.emit('validateCoordinates', {
        x: xCoor,
        y: yCoor,
        sessionId,
        partnerId
      });
      
      socket.emit('playerSubmitted', { sessionId, partnerId });
      
    } catch (error) {
      console.error('Error submitting coordinates:', error);
      setHasSubmitted(false);
    }        
  }, [socket, sessionId, partnerId, hasSubmitted, xCoor, yCoor, setHasSubmitted]);

  const validateCoordinate = useCallback(async () => {
    if (validatingCoordinate.current || xCoor === null || yCoor === null || !state.id || hasSubmitted) return;
    validatingCoordinate.current = true;
    
    try {
      console.log('Validating coordinates:', { xCoor, yCoor, id: state.id });
      
      if (socket?.connected) {
        socket.emit('validateCoordinates', {
          x: xCoor,
          y: yCoor,
          sessionId: sessionId || '',
          partnerId
        }, (response: any) => {
          console.log('Validation response:', response);
          if (response?.success) {
            setHasSubmitted(true);
          }
          // Always emit points to server for partner relay if present in response
          if (typeof response?.points === 'number') {
            socket.emit('points', {
              points: response.points,
              sessionId: sessionId || '',
              partnerId
            });
          }
        });
      } else {
        // Fallback to direct API call if WebSocket is not available
        const response = await fetch('/api/validateCoordinate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            xCoor,
            yCoor,
            id: state.id
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Validation result (fallback):', result);

        if (result.error) {
          console.error('Validation error:', result.error);
          return;
        }

        setXRightCoor(result.xCoor);
        setYRightCoor(result.yCoor);
        setTotalPoints(prev => prev + (result.points || 0));
        setQuestionCount(prev => prev + 1);
        setHasSubmitted(true);
        
        setTimeout(zoomToGuessAndAnswer, 100);
      }
    } catch (error) {
      console.error('Error validating coordinates:', error);
    } finally {
      validatingCoordinate.current = false;
    }
  }, [xCoor, yCoor, state.id, hasSubmitted, socket, sessionId, partnerId, setHasSubmitted, setXRightCoor, setYRightCoor, setTotalPoints, setQuestionCount, zoomToGuessAndAnswer]);

  return {
    handleSubmit,
    validateCoordinate,
  };
}
