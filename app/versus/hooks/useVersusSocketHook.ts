import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { GameState } from "../types";
import {
  FilteredClientGameType,
  UnfilteredClientGameType,
} from "@/server/types/GameType";

interface UseVersusSocketProps {
  socket: Socket | null;
  sessionId: string | null;
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
  setCurrentRoundScore: (points: number) => void;
  setShowResult: (show: boolean) => void;
  setRound: (round: number) => void;
  setShowPopup: (show: string | null) => void;
  setRematchStatus: (status: { player1Requested: boolean; player2Requested: boolean } | null) => void;
  setCountdown: (countdown: number | null) => void;
  setPartnerIsReady: (ready: boolean) => void;
  setOpponentSubmitTime?: (time: number | null) => void;
  setOpponentLeft: (left: boolean) => void;
  setIsReady: (ready: boolean) => void;
  setShowStartOverlay: (show: boolean) => void;
}

export function useVersusSocket({
  socket,
  sessionId,
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
  setCurrentRoundScore,
  setShowResult,
  setRound,
  setShowPopup,
  setRematchStatus,
  setCountdown,
  setPartnerIsReady,
  setOpponentSubmitTime,
  setOpponentLeft,
  setIsReady,
  setShowStartOverlay,
}: UseVersusSocketProps) {
  const currentRoundId = useRef<string | null>(null);
  const previousRoundPoints = useRef<number>(0);

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
      setOpponentHasSubmitted(false);
      setXCoor(null);
      setYCoor(null);
      setRound(data.currentRoundIndex);
      // Update cumulative scores from server data
      setTotalPoints(data.points);
      setPartnerPoints(data.partnerPoints);

      if (setOpponentSubmitTime) {
        setOpponentSubmitTime(null);
      }
    },
    [setState, setIsRoundComplete, setXRightCoor, setYRightCoor, setShowResult, setHasSubmitted, setOpponentHasSubmitted, setXCoor, setYCoor, setRound, setTotalPoints, setPartnerPoints, setOpponentSubmitTime]
  );

  const onRoundOver = useCallback(
    (data: UnfilteredClientGameType) => {
      console.log("[Versus] Round over:", data);
      setIsRoundComplete(true);
      setXRightCoor(data.answer.x);
      setYRightCoor(data.answer.y);
      setTotalPoints(data.points);
      setPartnerPoints(data.partnerPoints);
      // Calculate current round score (difference from previous total)
      const roundScore = data.points - previousRoundPoints.current;
      setCurrentRoundScore(roundScore);
      console.log("[Versus] Current round score:", roundScore, "Total:", data.points, "Previous:", previousRoundPoints.current);
      // Update previous round points for next calculation
      previousRoundPoints.current = data.points;
      setShowResult(true);

      if (setOpponentSubmitTime) {
        setOpponentSubmitTime(null);
      }
    },
    [setIsRoundComplete, setXRightCoor, setYRightCoor, setTotalPoints, setPartnerPoints, setCurrentRoundScore, setShowResult, setOpponentSubmitTime]
  );

  const onPlayerPoints = useCallback(
    (data: { points: number }) => {
      console.log("[Versus] Received player points:", data);
      setTotalPoints(data.points);
    },
    [setTotalPoints]
  );

  const onPartnerPoints = useCallback(
    (data: { points: number }) => {
      console.log("[Versus] Received partner points:", data);
      setPartnerPoints(data.points);
    },
    [setPartnerPoints]
  );

  const onPartnerSubmitted = useCallback((data?: { submittedAt?: number }) => {
    console.log("[Versus] Partner has submitted their guess", data);
    setOpponentHasSubmitted(true);
    if (data?.submittedAt && setOpponentSubmitTime) {
      setOpponentSubmitTime(data.submittedAt);
    }
  }, [setOpponentHasSubmitted, setOpponentSubmitTime]);

  const onPartnerReady = useCallback(() => {
    console.log("[Versus] Partner is ready");
    if (setPartnerIsReady) {
      setPartnerIsReady(true);
    }
  }, [setPartnerIsReady]);

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

  const emitPlayerReady = useCallback(() => {
    if (socket && sessionId) {
      console.log("[Versus] Emitting playerReady");
      socket.emit("playerReady", { sessionId });
    }
  }, [socket, sessionId]);

  // Socket event setup
  useEffect(() => {
    if (!socket || !sessionId) {
      console.log("[Versus] Socket or sessionId not available, waiting...");
      return;
    }

    console.log(`[Versus] Identifying session ${sessionId} to the server.`);
    socket.emit("joinedGame", { sessionId, socketId: socket.id });

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
    socket.on("partnerSubmitted", onPartnerSubmitted);
    socket.on("partnerReady", onPartnerReady);
    socket.on("gameOver", onGameOver);
    socket.on("rematchStatus", (status: { player1Requested: boolean; player2Requested: boolean }) => {
      console.log("[Versus] Rematch status update:", status);
      setRematchStatus(status);
      
      // Show toast when opponent requests rematch
      if ((status.player1Requested || status.player2Requested) && !(status.player1Requested && status.player2Requested)) {
        setToast("Opponent wants a rematch! Click Rematch to accept.");
      }
    });
    socket.on("rematchStarting", () => {
      console.log("[Versus] Rematch starting!");
      setRematchStatus(null);
      setCountdown(null);
      setShowPopup(null);
      setToast(null);
      setOpponentLeft(false);
      setIsReady(false);
      setPartnerIsReady(false);
      setHasSubmitted(false);
      setOpponentHasSubmitted(false);
      setIsRoundComplete(false);
      setShowResult(false);
      setShowStartOverlay(false); // Prevent start overlay from showing again
      // Let roundStart handle the rest
    });
    socket.on("opponentDisconnected", () => {
      console.log("[Versus] Opponent disconnected during rematch");
      setOpponentLeft(true);
      setToast("Opponent left. Rematch cancelled.");
      setRematchStatus(null);
    });
    socket.on("roomClosingCountdown", (data: { seconds: number }) => {
      setCountdown(data.seconds);
    });
    socket.on("roomClosed", (data: { message: string }) => {
      setToast(data.message);
      setShowPopup(data.message);
    });

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
      socket.off("partnerSubmitted", onPartnerSubmitted);
      socket.off("partnerReady", onPartnerReady);
      socket.off("gameOver", onGameOver);
      socket.off("rematchStatus");
      socket.off("rematchStarting");
      socket.off("opponentDisconnected");
      socket.off("roomClosingCountdown");
      socket.off("roomClosed");
    };
  }, [
    socket,
    sessionId,
    onConnect,
    onDisconnect,
    onConnectError,
    onReconnectAttempt,
    onReconnectError,
    onRoundStart,
    onRoundOver,
    onPlayerPoints,
    onPartnerPoints,
    onPartnerSubmitted,
    onPartnerReady,
    onGameOver,
  ]);

  const emitRematchRequest = useCallback(() => {
    if (socket && sessionId) {
      console.log("[Versus] Emitting requestRematch");
      socket.emit("requestRematch", { sessionId });
    }
  }, [socket, sessionId]);

  return {
    currentRoundId: currentRoundId.current,
    emitPlayerReady,
    emitRematchRequest,
  };
}
