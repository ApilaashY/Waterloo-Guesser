"use client";
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../components/SocketProvider';

export default function QueueGamePage() {
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "error">("idle");
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();
  const { socket, sessionId: contextSessionId } = useSocket();
  const [partnerId, setPartnerId] = useState<string | null>(null);

  // Toast component
  function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    React.useEffect(() => {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }, [onClose]);
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in">
        {message}
      </div>
    );
  }

  // Join the queue function
  const joinQueue = useCallback(() => {
    if (!socket) {
      setToast("Not connected to server. Please refresh the page.");
      return;
    }
    
    setStatus("searching");
    socket.emit("joinQueue", {}, (response: any) => {
      console.debug("[Queue] joinQueue response:", response);
      if (response?.error) {
        setToast(response.error);
        setStatus("idle");
      } else if (response?.sessionId && response?.partnerId) {
        // Handle successful match
        setPartnerId(response.partnerId);
        setStatus("matched");
        router.push(`/versus?sessionId=${response.sessionId}&partnerId=${response.partnerId}`);
      }
    });
  }, [socket, router]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log("[Queue] Socket not available yet");
      return;
    }

    console.log("[Queue] Setting up socket event listeners");

    const onConnect = () => {
      console.debug("[Queue] Socket.io connected");
      // Don't auto-join queue here to give user control
      setStatus("idle");
    };

    const onQueueMatched = (msg: any) => {
      console.debug("[Queue] Received queueMatched event:", msg);
      if (msg.partnerId && msg.sessionId) {
        setPartnerId(msg.partnerId);
        setStatus("matched");
        router.push(`/versus?sessionId=${msg.sessionId}&partnerId=${msg.partnerId}`);
      }
    };

    const onDisconnect = () => {
      console.debug("[Queue] Socket.io disconnected");
      setStatus("idle");
      setToast("Disconnected from server. Please try again.");
    };

    const onConnectError = (err: any) => {
      console.error("[Queue] Socket.io connect_error:", err);
      setToast("Connection error. Please try again.");
      setStatus("error");
    };

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("queueMatched", onQueueMatched);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Set initial status based on connection state
    if (socket.connected) {
      onConnect();
    }

    // Clean up event listeners on unmount
    return () => {
      console.debug("[Queue] Cleaning up socket event listeners");
      socket.off("connect", onConnect);
      socket.off("queueMatched", onQueueMatched);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket, router]);

  // Handle join queue button click
  const handleJoinQueue = useCallback(() => {
    if (!socket) {
      setToast("Connection not available. Please refresh the page.");
      return;
    }

    if (socket.connected) {
      joinQueue();
    } else {
      setStatus("searching");
      setToast("Connecting to server...");
      socket.connect();
    }
  }, [socket, joinQueue]);

  // Show appropriate status message
  const getStatusMessage = () => {
    switch (status) {
      case "searching":
        return "Searching for an opponent...";
      case "matched":
        return "Match found! Redirecting...";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Multiplayer Game</h1>
        
        {status === "idle" ? (
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                      transition-colors duration-200"
            onClick={handleJoinQueue}
            disabled={!socket}
          >
            {socket ? "Find an Opponent" : "Connecting..."}
          </button>
        ) : (
          <div className="py-4">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700">{getStatusMessage()}</p>
            </div>
          </div>
        )}
        
        {toast && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
            {toast}
          </div>
        )}
        
        {status === "idle" && (
          <p className="mt-4 text-sm text-gray-600">
            Play against another player in real-time!
          </p>
        )}
      </div>
    </div>
  );
}


