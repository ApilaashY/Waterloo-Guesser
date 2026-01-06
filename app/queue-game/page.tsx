"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "../../components/SocketProvider";

export default function QueueGamePage() {
  const [status, setStatus] = useState<
    "idle" | "searching" | "matched" | "error"
  >("idle");
  const { socket, sessionId: contextSessionId } = useSocket();
  const [playerName, setPlayerName] = useState("");

  const generateRandomName = () => {
    const adjectives = ["Swift", "Brave", "Clever", "Quick", "Eager", "Bright", "Sharp"];
    const nouns = ["Goose", "Warrior", "Scholar", "Player", "Student", "Ranger", "Scout"];
    const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
    setPlayerName(randomName);
  };

  // Auto-generate name on mount so it's mandatory/pre-filled
  useEffect(() => {
    generateRandomName();
  }, []);

  function handleJoinQueue() {
    if (!socket) {
      setStatus("error");
      return;
    }

    // Validate name
    if (!playerName.trim()) {
      // Should not happen if auto-generated, but safety check
      generateRandomName();
      return;
    }

    // Save name to session storage
    sessionStorage.setItem("versus_player_name", playerName.trim());

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
          <div className="w-full space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Random Player Name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
                value={playerName}
                readOnly
              />
              <button
                onClick={generateRandomName}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                title="Generate New Random Name"
              >
                🎲
              </button>
            </div>

            <button
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                        transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleJoinQueue}
              disabled={!socket || !playerName}
            >
              {socket ? "Find an Opponent" : "Connecting..."}
            </button>
          </div>
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
