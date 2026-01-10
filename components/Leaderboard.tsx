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

  // Faculty configuration with refined colors
  const facultySymbols: Record<string, { imagePath: string; color: string; glowColor: string }> = {
    Engineering: {
      imagePath: "/Engineering-Symbol.png",
      color: "from-emerald-500 to-teal-600",
      glowColor: "shadow-emerald-500/30",
    },
    Health: {
      imagePath: "/Health.png",
      color: "from-rose-500 to-red-600",
      glowColor: "shadow-rose-500/30",
    },
    Mathematics: {
      imagePath: "/Math.png",
      color: "from-cyan-500 to-blue-600",
      glowColor: "shadow-cyan-500/30",
    },
    Environment: {
      imagePath: "/Environment-Symbol.png",
      color: "from-amber-500 to-yellow-600",
      glowColor: "shadow-amber-500/30",
    },
    Arts: {
      imagePath: "/Art-Symbol.png",
      color: "from-violet-500 to-purple-600",
      glowColor: "shadow-violet-500/30",
    },
    Science: {
      imagePath: "/Science-Symbol.png",
      color: "from-sky-500 to-cyan-600",
      glowColor: "shadow-sky-500/30",
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
      {/* Main container with dark glassmorphic style */}
      <div className="relative max-w-7xl mx-auto rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl shadow-black/20 overflow-hidden">
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
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm p-5 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">By Faculty</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Top {facultyData.length}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
                </div>
              ) : (
                <ol className="space-y-2.5">
                  {facultyData.map((faculty, id) => (
                    <li
                      key={faculty.department}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${selectedFaculty === faculty.department
                        ? "bg-white/[0.08] border border-white/[0.15]"
                        : "hover:bg-white/[0.04] border border-transparent"
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
                        <div className="font-medium text-white text-sm">
                          {faculty.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-white">
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
                className="text-center text-slate-400 font-medium text-sm uppercase tracking-wider"
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
            <div className="rounded-xl bg-white/[0.03] backdrop-blur-sm p-5 border border-white/[0.08]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Top Players</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {periodLabels[selectedPeriod]}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
                </div>
              ) : userLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-medium text-slate-400">No scores yet</p>
                  <p className="text-xs mt-1 text-slate-500">Be the first to play!</p>
                </div>
              ) : (
                <ol className="space-y-2.5">
                  {userLeaderboard.map((playerData, idx) => (
                    <li
                      key={`${playerData.username}-${idx}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow-lg ${idx === 0
                          ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-900 shadow-amber-500/30"
                          : idx === 1
                            ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 shadow-slate-400/30"
                            : idx === 2
                              ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-amber-600/30"
                              : "bg-white/[0.08] text-slate-300 border border-white/[0.1]"
                          }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {playerData.username}
                        </div>
                        {playerData.gamesPlayed && (
                          <div className="text-xs text-slate-500">
                            {playerData.gamesPlayed} game
                            {playerData.gamesPlayed !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-white">
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
