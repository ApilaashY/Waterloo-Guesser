"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

type Period = "all-time" | "daily" | "weekly" | "monthly";

export default function Leaderboard() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("Engineering");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("daily");
  const [facultyData, setFacultyData] = useState<FacultyEntry[]>([]);
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Faculty configuration with homepage color scheme
  const facultySymbols: Record<string, { imagePath: string; color: string; glowColor: string }> = {
    Engineering: {
      imagePath: "/Engineering-Symbol.png",
      color: "from-accent-primary to-accent-primary/80",
      glowColor: "shadow-accent-primary/30",
    },
    Health: {
      imagePath: "/Health.png",
      color: "from-accent-primary/90 to-accent-primary/70",
      glowColor: "shadow-accent-primary/25",
    },
    Mathematics: {
      imagePath: "/Math.png",
      color: "from-accent-primary/80 to-accent-primary/60",
      glowColor: "shadow-accent-primary/20",
    },
    Environment: {
      imagePath: "/Environment-Symbol.png",
      color: "from-accent-primary/70 to-accent-primary/50",
      glowColor: "shadow-accent-primary/15",
    },
    Arts: {
      imagePath: "/Art-Symbol.png",
      color: "from-accent-primary/85 to-accent-primary/65",
      glowColor: "shadow-accent-primary/25",
    },
    Science: {
      imagePath: "/Science-Symbol.png",
      color: "from-accent-primary/75 to-accent-primary/55",
      glowColor: "shadow-accent-primary/20",
    },
  };

  // Period labels
  const periodLabels: Record<Period, string> = {
    "all-time": "All Time",
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
  };

  // Fetch data when period changes
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

      fetch(`/api/leaderboard/users?period=${selectedPeriod}&limit=10`, {
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
  }, [selectedPeriod]);

  return (
    <div className="w-full mx-auto px-4 sm:px-6">
      {/* Main container with homepage theme style */}
      <div className="relative max-w-7xl mx-auto rounded-2xl bg-root/40 backdrop-blur-xl border border-primary/10 p-6 sm:p-8 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Atmospheric gradient background - Semantic */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-1/2 -right-1/4 w-[60%] h-[120%] bg-gradient-to-bl from-accent-primary/20 via-primary/5 to-transparent rounded-full blur-[80px]" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[50%] h-[120%] bg-gradient-to-tr from-accent-primary/20 via-accent-soft/10 to-transparent rounded-full blur-[80px]" />
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with period selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <span className="inline-block px-4 py-1.5 mb-3 text-xs font-semibold tracking-widest uppercase text-accent-primary bg-accent-primary/10 rounded-full border border-accent-primary/20">
                Rankings
              </span>
              <h2
                className="text-3xl sm:text-4xl font-bold text-primary tracking-tight text-glow"
                style={{ fontFamily: "Felgine, sans-serif" }}
              >
                LEADERBOARD
              </h2>
            </div>

            {/* Period selector - refined */}
            <div className="flex gap-1.5 bg-root/40 backdrop-blur-sm rounded-xl p-1.5 border border-primary/10">
              {(["daily", "weekly", "monthly", "all-time"] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedPeriod === period
                    ? "bg-accent-primary text-root shadow-lg shadow-accent-primary/25 font-bold"
                    : "text-secondary hover:text-primary hover:bg-primary/5"
                    }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Faculty Totals */}
            <div className="rounded-xl bg-surface/40 backdrop-blur-sm p-5 border border-primary/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-primary">By Faculty</h3>
                <span className="text-xs text-secondary font-medium">
                  Top {facultyData.length}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent" />
                </div>
              ) : (
                <ol className="space-y-2.5">
                  {facultyData.map((faculty, id) => (
                    <li
                      key={faculty.department}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedFaculty === faculty.department
                        ? "bg-accent-primary/20 border border-accent-primary/30"
                        : "hover:bg-primary/5 border border-transparent"
                        }`}
                      onClick={() => setSelectedFaculty(faculty.department)}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${facultySymbols[faculty.department]?.color ||
                          "from-gray-500 to-gray-600"
                          } text-white font-bold text-sm shadow-lg ${facultySymbols[faculty.department]?.glowColor || ""}`}
                      >
                        {id + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-primary text-sm">
                          {faculty.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-primary">
                          {faculty.totalPoints.toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Middle: Faculty Symbols */}
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div
                className="text-center text-secondary font-medium text-sm uppercase tracking-wider"
                style={{ fontFamily: "Felgine, sans-serif" }}
              >
                Select Faculty
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {Object.keys(facultySymbols).map((faculty) => (
                  <button
                    key={faculty}
                    onClick={() => setSelectedFaculty(faculty)}
                    className="group relative flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110"
                    title={faculty}
                  >
                    <div
                      className={`w-16 h-16 flex items-center justify-center transition-all duration-300 rounded-full ${selectedFaculty === faculty
                        ? "bg-accent-primary shadow-[0_0_20px_var(--accent-primary)]"
                        : ""
                        }`}
                    >
                      <div className="relative w-12 h-12">
                        <Image
                          src={facultySymbols[faculty].imagePath}
                          alt={`${faculty} Symbol`}
                          fill
                          className={`object-contain transition-all duration-300 ${selectedFaculty === faculty
                            ? "brightness-0 invert drop-shadow-[0_0_8px_white]"
                            : "brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:brightness-0 group-hover:invert group-hover:drop-shadow-[0_0_8px_white]"
                            }`}
                        />
                      </div>
                    </div>

                    {/* Label - visible on hover or selected */}
                    <span
                      className={`text-xs font-medium transition-all duration-300 ${selectedFaculty === faculty
                          ? "text-accent-primary opacity-100 translate-y-0"
                          : "text-secondary opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                        }`}
                    >
                      {faculty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Top Players */}
            <div className="rounded-xl bg-surface/40 backdrop-blur-sm p-5 border border-primary/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-primary">Top Players</h3>
                <span className="text-xs text-secondary font-medium">
                  {periodLabels[selectedPeriod]}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent" />
                </div>
              ) : userLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-medium text-secondary">No scores yet</p>
                  <p className="text-xs mt-1 text-secondary/70">Be the first to play!</p>
                </div>
              ) : (
                <ol className="space-y-2.5">
                  {userLeaderboard.map((playerData, idx) => (
                    <li
                      key={`${playerData.username}-${idx}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-all duration-200"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow-lg ${idx === 0
                          ? "bg-gradient-to-br from-accent-primary to-accent-primary/80 text-root shadow-accent-primary/30"
                          : idx === 1
                            ? "bg-gradient-to-br from-primary/60 to-primary/40 text-root shadow-primary/20"
                            : idx === 2
                              ? "bg-gradient-to-br from-accent-primary/60 to-accent-primary/40 text-primary shadow-accent-primary/20"
                              : "bg-surface/60 text-primary border border-primary/20"
                          }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary text-sm truncate">
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
                        <div className="font-mono font-semibold text-primary">
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
  );
}
