"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface SocketContextType {
  socket: Socket | null;
  sessionId: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  sessionId: null,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  // Try to restore session from localStorage on mount
  // useEffect(() => {
  //   const savedSessionId = localStorage.getItem('sessionId');
  //   if (savedSessionId) {
  //     setSessionId(savedSessionId);
  //   }
  // }, []);

  const socket = useMemo(() => {
    // Get WebSocket server URL from environment variable or default to local
    const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001";
    
    console.log("[Socket] Connecting to WebSocket server:", WEBSOCKET_URL);
    
    // Create socket connection
    const socket = io(WEBSOCKET_URL, {
      path: "/socket.io/",
      autoConnect: true, // Auto connect to establish the connection immediately
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Don't include sessionId in query - we'll send it via emit after connection
    });

    // Log connection events
    socket.on("connect", () => {
      console.log("[Socket] Connected with ID:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
    });

    socket.onAny((event, ...args) => {
      console.log(`[Socket] Received event '${event}':`, args);
    });

    return socket;
  }, []); // Keep empty dependency array to create socket only once

  // Handle session restoration when socket or sessionId changes
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log("[Socket] Connected with ID:", socket.id);

      // If we have a sessionId, identify ourselves to the server
      if (sessionId) {
        console.log("[Socket] Identifying session to server:", sessionId);
        socket.emit("identifySession", sessionId);

        console.log("[Socket] Attempting to restore session:", sessionId);

        socket.emit(
          "restoreSession",
          sessionId,
          (response: { success: boolean; sessionId?: string }) => {
            if (response.success) {
              console.log(
                "[Socket] Successfully restored session:",
                response.sessionId
              );
              // Update session ID in case it was refreshed
              if (response.sessionId && response.sessionId !== sessionId) {
                setSessionId(response.sessionId);
                localStorage.setItem("sessionId", response.sessionId);
                // Re-identify with the new session ID
                socket.emit("identifySession", response.sessionId);
              }
            } else {
              console.log(
                "[Socket] Could not restore session, starting new one"
              );
              // Clear the invalid session ID
              localStorage.removeItem("sessionId");
              setSessionId(null);
            }
          }
        );
      }
    };

    const onDisconnect = (reason: string) => {
      console.log("[Socket] Disconnected:", reason);
    };

    const onConnectError = (error: Error) => {
      console.error("[Socket] Connection error:", error);
    };

    const onQueueMatched = (data: {
      sessionId: string;
      partnerId: string;
      matchId: string;
      isReconnect?: boolean;
    }) => {
      console.log("[Socket] Queue matched:", data);
      // Store the session ID for reconnection
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);

      // Identify ourselves to the server with the new session ID
      console.log(
        "[Socket] Identifying session to server after match:",
        data.sessionId
      );
      socket.emit("identifySession", data.sessionId);

      if (!data.isReconnect) {
        // Only trigger navigation for new matches, not reconnects
        // The round data will be sent separately for reconnects
        // Use Next.js router for client-side navigation to preserve socket connection
        router.push(
          `/versus?sessionId=${data.sessionId}&partnerId=${data.partnerId}`
        );
      }
    };

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("queueMatched", onQueueMatched);

    // Clean up - only remove event listeners, don't disconnect socket
    return () => {
      console.log("[Socket] Cleaning up event listeners");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("queueMatched", onQueueMatched);
      // Don't disconnect the socket - keep the same connection
    };
  }, [socket, sessionId, router]);

  // Cleanup socket connection only on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        console.log("[Socket] Component unmounting, disconnecting socket");
        socket.disconnect();
      }
    };
  }, [socket]);

  const contextValue = useMemo(
    () => ({
      socket,
      sessionId,
    }),
    [socket, sessionId]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
