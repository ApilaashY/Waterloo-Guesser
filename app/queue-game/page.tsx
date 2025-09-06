"use client";

import React, { useState } from "react";
import { useSocket } from "../../components/SocketProvider";

export default function QueueGamePage() {
  const [status, setStatus] = useState<
    "idle" | "searching" | "matched" | "error"
  >("idle");
  const { socket, sessionId: contextSessionId } = useSocket();

  function handleJoinQueue() {
    if (!socket) {
      setStatus("error");
      return;
    }
    setStatus("searching");
    socket.emit(
      "joinQueue",
      { sessionId: contextSessionId },
      (response: any) => {
        console.log("[Queue] joinQueue response:", response);
        if (response?.error) {
          setStatus("error");
        } else if (response?.sessionId && response?.partnerId) {
          setStatus("matched");
        }
      }
    );
  }

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
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Multiplayer Game
        </h1>

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

        {status === "idle" && (
          <p className="mt-4 text-sm text-gray-600">
            Play against another player in real-time!
          </p>
        )}
      </div>
    </div>
  );
}
