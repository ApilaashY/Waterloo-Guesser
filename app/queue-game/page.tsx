"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSocket } from "../../components/SocketProvider";
import Link from "next/link";
import { ArrowLeft, Users, Zap, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { LoadingState } from "../versus/components/States";

function QueueGameContent() {
  const [status, setStatus] = useState<
    "idle" | "searching" | "matched" | "error"
  >("idle");
  const { socket, sessionId: contextSessionId } = useSocket();
  const [playerName, setPlayerName] = useState("");
  const searchParams = useSearchParams();
  const modifier = searchParams.get("modifier") || undefined;

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

  // Leave queue when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (socket && status === "searching") {
        console.log("[Queue] Leaving queue on unmount");
        socket.emit("leaveQueue");
      }
    };
  }, [socket, status]);

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
      { sessionId: contextSessionId, modifier },
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-root text-primary selection:bg-accent-primary/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-soft/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <Link
          href="/modes"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Modes
        </Link>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-primary/20">
              <Users className="w-8 h-8 text-accent-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-primary mb-2 text-glow">
              Multiplayer Game
            </h1>
            <p className="text-secondary font-data text-sm">
              Enter the arena and test your skills
            </p>
            {modifier && modifier !== "normal" && (
              <div className="mt-3">
                <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {modifier === "timed" ? "⏱️ TIMED MODE" : modifier === "grayscale" ? "🎨 90s MODE" : modifier.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {status === "idle" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block">Your Alias</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Zap className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Random Player Name"
                      className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-primary font-medium focus:outline-none cursor-not-allowed opacity-70"
                      value={playerName}
                      readOnly
                    />
                  </div>
                  <button
                    onClick={generateRandomName}
                    className="px-4 bg-white/5 hover:bg-white/10 text-primary rounded-xl border border-white/10 transition-colors flex items-center justify-center"
                    title="Generate New Random Name"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  className="w-full py-4 bg-accent-primary hover:bg-accent-primary/80 text-white rounded-xl shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  onClick={handleJoinQueue}
                  disabled={!socket || !playerName}
                >
                  <span className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                    {socket ? (
                      <>
                        <Search className="w-5 h-5" />
                        Find an Opponent
                      </>
                    ) : (
                      "Connecting..."
                    )}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="w-8 h-8 text-accent-primary/50" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-primary font-bold text-lg animate-pulse">{getStatusMessage()}</p>
                  <p className="text-sm text-secondary">Good luck!</p>
                </div>
              </div>
            </div>
          )}

          {status === "idle" && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-secondary/60">
                Play against another player in real-time!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QueueGamePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <QueueGameContent />
    </Suspense>
  );
}
