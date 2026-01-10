"use client";

import { useSocket } from "./SocketProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LiveMatch {
  sessionId: string;
  currentRound: number;
  maxRounds: number;
  player1Points: number;
  player2Points: number;
  spectatorCount: number;
}

function MatchCard({ match }: { match: LiveMatch }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-600 font-bold text-sm">LIVE</span>
        </div>
        <span className="text-gray-600 text-sm">
          Round {match.currentRound}/{match.maxRounds}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-semibold">Player 1</span>
          <span className="text-2xl font-bold">{match.player1Points}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-red-600 font-semibold">Player 2</span>
          <span className="text-2xl font-bold">{match.player2Points}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-1 text-gray-500 text-sm">
          <span>👁️</span>
          <span>{match.spectatorCount} watching</span>
        </div>
        <button
          onClick={() => router.push(`/versus/spectate/${match.sessionId}`)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Watch
        </button>
      </div>
    </div>
  );
}

export default function LiveMatches() {
  const { socket } = useSocket();
  const [matches, setMatches] = useState<LiveMatch[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Request initial list
    socket.emit("listActiveMatches");

    // Listen for updates
    socket.on("activeMatchesUpdate", (newMatches: LiveMatch[]) => {
      console.log("[LiveMatches] Received matches:", newMatches);
      setMatches(newMatches);
    });

    // Poll every 5 seconds for updates
    const interval = setInterval(() => {
      socket.emit("listActiveMatches");
    }, 5000);

    return () => {
      socket.off("activeMatchesUpdate");
      clearInterval(interval);
    };
  }, [socket]);

  if (matches.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <h2 className="text-3xl font-bold text-gray-800">Live Matches</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard key={match.sessionId} match={match} />
        ))}
      </div>
    </div>
  );
}
