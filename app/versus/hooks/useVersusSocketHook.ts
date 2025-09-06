import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { GameState, RoundData, ValidationResult } from "../types";
import {
  FilteredClientGameType,
  UnfilteredClientGameType,
} from "@/server/types/GameType";

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
  setRound: (round: number) => void;
  setShowPopup: (show: string) => void;
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
  setRound,
  setShowPopup,
}: UseVersusSocketProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoundId = useRef<string | null>(null);

  // Connection handlers
  const onConnect = useCallback(() => {
    console.log("[Versus] Socket.io connected");
    setToast(null);
  }, [setToast]);

  const onDisconnect = useCallback(() => {
    console.log("[Versus] Socket.io disconnected");
    setToast("Disconnected from server. Attempting to reconnect...");
  }, [setToast]);

  const onConnectError = useCallback(
    (error: Error) => {
      console.error("[Versus] Socket.io connection error:", error);
      setToast(`Connection error: ${error.message}`);
    },
    [setToast]
  );

  const onReconnectAttempt = useCallback(
    (attemptNumber: number) => {
      console.log(`[Versus] Reconnect attempt ${attemptNumber}`);
      setToast(`Attempting to reconnect (${attemptNumber})...`);
    },
    [setToast]
  );

  const onReconnectError = useCallback(
    (error: Error) => {
      console.error("[Versus] Socket.io reconnection error:", error);
      setToast(`Reconnection failed: ${error.message}`);
    },
    [setToast]
  );

  const onRoundStart = useCallback(
    (data: FilteredClientGameType) => {
      console.log("[Versus] Round started:", data);
      setState((prev) => ({
        ...prev,
        image: data.imageUrl,
      }));
      setIsRoundComplete(false);
      setXRightCoor(null);
      setYRightCoor(null);
      setShowResult(false);
      setHasSubmitted(false);
      setXCoor(null);
      setYCoor(null);
      setRound(data.currentRoundIndex);
    },
    [setState]
  );

  const onRoundOver = useCallback(
    (data: UnfilteredClientGameType) => {
      console.log("[Versus] Round over:", data);
      setIsRoundComplete(true);
      setXRightCoor(data.answer.x);
      setYRightCoor(data.answer.y);
      setTotalPoints(data.points);
      setPartnerPoints(data.partnerPoints);
      setShowResult(true);
    },
    [setState]
  );

  const onPlayerPoints = useCallback(
    (data: { points: number }) => {
      console.log("[Versus] Received player points:", data);
      setTotalPoints(data.points);
    },
    [setTotalPoints, setHasSubmitted]
  );

  const onPartnerPoints = useCallback(
    (data: { points: number }) => {
      console.log("[Versus] Received partner points:", data);
      setPartnerPoints(data.points);
    },
    [setPartnerPoints, setOpponentHasSubmitted]
  );

  const onGameOver = useCallback(
    async (data: { winner: string; tie: boolean }) => {
      console.log("[Versus] Game over:", data);
      if (data.tie) {
        setShowPopup("It's a Tie!");
      } else {
        if (socket?.id == data.winner) {
          setShowPopup("You Win!");
        } else {
          setShowPopup("You Lose!");
        }
      }
      // Don't navigate automatically - let the user click the button
    },
    [setShowPopup]
  );

  // Socket event setup
  useEffect(() => {
    if (!socket || !sessionId) {
      console.log("[Versus] Socket or sessionId not available, waiting...");
      return;
    }

    console.log(`[Versus] Identifying session ${sessionId} to the server.`);
    socket.emit("identify", sessionId);

    console.log("[Versus] Setting up socket event listeners");

    // Connection events
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on("reconnect_error", onReconnectError);

    // Game events
    socket.on("roundStart", onRoundStart);
    socket.on("roundOver", onRoundOver);
    socket.on("playerPoints", onPlayerPoints);
    socket.on("partnerPoints", onPartnerPoints);
    socket.on("gameOver", onGameOver);

    return () => {
      console.debug("[useEffect] Cleaning up...");

      // Remove event listeners
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("reconnect_error", onReconnectError);
      socket.off("roundStart", onRoundStart);
      socket.off("roundOver", onRoundOver);
      socket.off("playerPoints", onPlayerPoints);
      socket.off("partnerPoints", onPartnerPoints);
      socket.off("gameOver", onGameOver); // Add this missing cleanup
    };
  }, [
    socket,
    sessionId,
    state.image,
    onConnect,
    onDisconnect,
    onConnectError,
    onReconnectAttempt,
    onReconnectError,
    setIsRoundComplete,
    setHasSubmitted,
  ]);

  return {
    currentRoundId: currentRoundId.current,
  };
}
