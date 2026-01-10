"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DailyLeaderboard from "@/components/DailyLeaderboard";

type LeaderboardEntry = {
  username: string;
  totalPoints: number;
  department?: string;
  gamesPlayed?: number;
  isRegistered?: boolean;
};

type FacultyEntry = {
  department: string;
  totalPoints: number;
};

export default function Page() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("Engineering");
  const [facultyData, setFacultyData] = useState<FacultyEntry[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Faculty configuration with homepage color scheme
  const facultySymbols: Record<
    string,
    {
      imagePath: string;
      color: string;
      bgColor: string;
      hueColor: string;
      iconFilter: string;
    }
  > = {
    Engineering: {
      imagePath: "/Engineering-Symbol.png",
      color: "from-accent-primary to-accent-primary/80",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(31%) sepia(54%) saturate(1289%) hue-rotate(242deg) brightness(85%) contrast(91%)",
    },
    Health: {
      imagePath: "/Health.png",
      color: "from-accent-primary/90 to-accent-primary/70",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(41%) sepia(89%) saturate(1067%) hue-rotate(139deg) brightness(97%) contrast(101%)",
    },
    Mathematics: {
      imagePath: "/Math.png",
      color: "from-accent-primary/80 to-accent-primary/60",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(50%) sepia(86%) saturate(2618%) hue-rotate(285deg) brightness(101%) contrast(84%)",
    },
    Environment: {
      imagePath: "/Environment-Symbol.png",
      color: "from-accent-primary/70 to-accent-primary/50",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(29%) sepia(17%) saturate(1183%) hue-rotate(109deg) brightness(93%) contrast(88%)",
    },
    Arts: {
      imagePath: "/Art-Symbol.png",
      color: "from-accent-primary/85 to-accent-primary/65",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(54%) sepia(82%) saturate(4851%) hue-rotate(343deg) brightness(100%) contrast(101%)",
    },
    Science: {
      imagePath: "/Science-Symbol.png",
      color: "from-accent-primary/75 to-accent-primary/55",
      bgColor: "var(--accent-primary)",
      hueColor: "var(--accent-soft)",
      iconFilter:
        "brightness(0) saturate(100%) invert(16%) sepia(98%) saturate(3176%) hue-rotate(212deg) brightness(92%) contrast(104%)",
    },
  };

  // Fetch data on mount
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch("/api/leaderboard/faculty", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setFacultyData(data);
          }
        })
        .catch((error) => console.error("Error fetching faculty leaderboard:", error)),

      fetch("/api/leaderboard/users?period=all-time&limit=10", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.leaderboard)) {
            setUserLeaderboard(data.leaderboard);
          }
        })
        .catch((error) => console.error("Error fetching user leaderboard:", error)),
    ]).finally(() => setLoading(false));
  }, []);

  const selectedFacultyPlayers = userLeaderboard.filter(
    (player) => player.department === selectedFaculty
  );

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: `radial-gradient(
          1200px 600px at 10% 10%,
          var(--accent-soft),
          transparent 15%
        ),
        radial-gradient(
          900px 500px at 90% 80%,
          var(--accent-primary)/20,
          transparent 18%
        ),
        linear-gradient(180deg, var(--bg-surface), var(--bg-root))`,
        backgroundColor: "var(--bg-root)",
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto p-6 relative z-20">
        {/* Main container with homepage theme styling */}
        <div className="relative rounded-3xl bg-root/40 backdrop-blur-md border-2 border-primary/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Decorative gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 via-transparent to-accent-primary/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8 mt-6">
              <h2
                className="text-3xl sm:text-4xl font-bold text-primary"
                style={{ fontFamily: "Felgine, sans-serif" }}
              >
                FACULTY LEADERBOARD
              </h2>
            </div>

            {/* Faculty Symbols Horizontal Row */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mb-10 px-4 py-6 bg-surface/30 backdrop-blur-sm rounded-2xl border-2 border-primary/20 transition-all duration-300">
              {Object.entries(facultySymbols).map(
                ([name, { imagePath, bgColor, iconFilter }]) => {
                  const isSelected = selectedFaculty === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedFaculty(name)}
                      className={`relative w-16 h-16 transition-all duration-300 hover:scale-110 ${isSelected ? "scale-125 drop-shadow-2xl" : "opacity-60 hover:opacity-90"
                        }`}
                      title={name}
                    >
                      {/* Circular blurred halo behind the icon when selected */}
                      {isSelected && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "120%",
                            height: "120%",
                            backgroundColor: bgColor,
                            borderRadius: "50%",
                            filter: "blur(12px)",
                            opacity: 0.7,
                            zIndex: 0,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Icon on top of halo */}
                      <div className="relative z-10 w-full h-full">
                        <Image
                          src={imagePath}
                          alt={`${name} Symbol`}
                          fill
                          className="object-contain"
                          style={{
                            filter: isSelected
                              ? iconFilter
                              : "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(3000%) hue-rotate(246deg) brightness(70%) contrast(100%)",
                          }}
                        />
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left: Faculty Totals */}
              <div className="rounded-2xl bg-surface/50 backdrop-blur-md border border-primary/10 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-primary">By Faculty</h3>
                  <span className="text-sm text-secondary font-medium">
                    Top {facultyData.length}
                  </span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
                  </div>
                ) : (
                  <ol className="space-y-3">
                    {facultyData.map((faculty, idx) => (
                      <li
                        key={faculty.department}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedFaculty === faculty.department
                            ? "bg-accent-primary/20 border border-accent-primary/30 scale-105 shadow-md"
                            : "hover:bg-primary/5 hover:scale-102"
                          }`}
                        onClick={() => setSelectedFaculty(faculty.department)}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${facultySymbols[faculty.department]?.color ||
                            "from-accent-primary/40 to-accent-primary/60"
                            } text-white font-bold text-lg shadow-md`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-primary">
                            {faculty.department}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-primary text-lg">
                            {faculty.totalPoints.toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Middle: Daily Leaderboard */}
              <div>
                <DailyLeaderboard />
              </div>

              {/* Right: Selected Faculty Players */}
              <div className="rounded-2xl bg-surface/50 backdrop-blur-md border border-primary/10 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-primary">
                    {selectedFaculty} Players
                  </h3>
                  <span className="text-sm text-secondary font-medium">
                    Top Players
                  </span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
                  </div>
                ) : selectedFacultyPlayers.length === 0 ? (
                  <div className="text-center py-12 text-secondary">
                    <p className="text-sm font-medium">No players yet</p>
                    <p className="text-xs mt-1">Be the first from {selectedFaculty}!</p>
                  </div>
                ) : (
                  <ol className="space-y-3">
                    {selectedFacultyPlayers.slice(0, 10).map((playerData, idx) => (
                      <li
                        key={`${playerData.username}-${idx}`}
                        className="flex items-center gap-3 group hover:scale-102 transition-transform duration-200"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg shadow-md ${idx === 0
                              ? "bg-gradient-to-br from-accent-primary to-accent-primary/80 text-root"
                              : idx === 1
                                ? "bg-gradient-to-br from-primary/60 to-primary/40 text-root"
                                : idx === 2
                                  ? "bg-gradient-to-br from-accent-primary/60 to-accent-primary/40 text-primary"
                                  : "bg-gradient-to-br from-surface/60 to-surface/40 text-primary"
                            }`}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-primary truncate">
                            {playerData.username}
                          </div>
                          {playerData.gamesPlayed && (
                            <div className="text-xs text-secondary">
                              {playerData.gamesPlayed} game
                              {playerData.gamesPlayed !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-primary text-lg">
                            {playerData.totalPoints.toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
