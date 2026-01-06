"use client";

import React, { useEffect, useState } from "react";
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

  // Faculty configuration
  const facultySymbols: Record<string, { imagePath: string; color: string }> = {
    Engineering: {
      imagePath: "/Engineering-Symbol.png",
      color: "from-green-400 to-green-600",
    },
    Health: {
      imagePath: "/Health.png",
      color: "from-red-400 to-red-600",
    },
    Mathematics: {
      imagePath: "/Math.png",
      color: "from-blue-400 to-blue-600",
    },
    Environment: {
      imagePath: "/Environment-Symbol.png",
      color: "from-yellow-400 to-yellow-600",
    },
    Arts: {
      imagePath: "/Art-Symbol.png",
      color: "from-purple-400 to-purple-600",
    },
    Science: {
      imagePath: "/Science-Symbol.png",
      color: "from-cyan-400 to-cyan-600",
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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* Outer container matching hero style */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-100/80 via-blue-50/60 to-blue-200/80 backdrop-blur-sm border-2 border-[#090C9B]/20 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative gradient overlays similar to hero */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 via-transparent to-blue-400/10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header with period selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#090C9B]"
              style={{ fontFamily: "Felgine, sans-serif" }}
            >
              LEADERBOARD
            </h2>

            {/* Period selector */}
            <div className="flex gap-2 bg-white/40 backdrop-blur-sm rounded-full p-1.5 border border-[#090C9B]/20">
              {(["daily", "weekly", "monthly", "all-time"] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedPeriod === period
                      ? "bg-[#090C9B] text-white shadow-lg scale-105"
                      : "text-[#090C9B] hover:bg-white/50"
                  }`}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left: Faculty Totals */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 shadow-lg border border-[#090C9B]/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[#090C9B]">By Faculty</h3>
                <span className="text-sm text-[#090C9B]/70 font-medium">
                  Top {facultyData.length}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#090C9B]" />
                </div>
              ) : (
                <ol className="space-y-3">
                  {facultyData.map((faculty, id) => (
                    <li
                      key={faculty.department}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedFaculty === faculty.department
                          ? "bg-gradient-to-r from-[#090C9B]/20 to-blue-300/30 scale-105 shadow-md"
                          : "hover:bg-white/40 hover:scale-102"
                      }`}
                      onClick={() => setSelectedFaculty(faculty.department)}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${
                          facultySymbols[faculty.department]?.color ||
                          "from-gray-400 to-gray-600"
                        } text-white font-bold text-lg shadow-md`}
                      >
                        {id + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[#090C9B]">
                          {faculty.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#090C9B] text-lg">
                          {faculty.totalPoints.toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Middle: Faculty Symbols */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div
                className="text-center mb-2 text-[#090C9B] font-bold text-lg"
                style={{ fontFamily: "Felgine, sans-serif" }}
              >
                SELECT FACULTY
              </div>
              <div className="grid grid-cols-3 gap-6">
                {Object.keys(facultySymbols).map((faculty) => (
                  <button
                    key={faculty}
                    onClick={() => setSelectedFaculty(faculty)}
                    className={`relative transition-all duration-300 hover:scale-110 ${
                      selectedFaculty === faculty
                        ? "scale-125 drop-shadow-2xl"
                        : "opacity-60 hover:opacity-90"
                    }`}
                    title={faculty}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                        selectedFaculty === faculty
                          ? "bg-gradient-to-br from-white/80 to-blue-100/60 shadow-xl border-2 border-[#090C9B]/30"
                          : "bg-white/40"
                      }`}
                    >
                      <div className="relative w-12 h-12">
                        <Image
                          src={facultySymbols[faculty].imagePath}
                          alt={`${faculty} Symbol`}
                          fill
                          className="object-contain filter brightness-0 saturate-100"
                          style={{
                            filter:
                              selectedFaculty === faculty
                                ? "brightness(0) saturate(100%) invert(9%) sepia(100%) saturate(7426%) hue-rotate(246deg) brightness(87%) contrast(143%)"
                                : "brightness(0) saturate(100%) invert(9%) sepia(50%) saturate(3000%) hue-rotate(246deg) brightness(70%) contrast(100%)",
                          }}
                        />
                      </div>
                    </div>
                    {selectedFaculty === faculty && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-[#090C9B] whitespace-nowrap">
                        {faculty}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Top Players */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-md p-6 shadow-lg border border-[#090C9B]/10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[#090C9B]">Top Players</h3>
                <span className="text-sm text-[#090C9B]/70 font-medium">
                  {periodLabels[selectedPeriod]}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#090C9B]" />
                </div>
              ) : userLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-[#090C9B]/60">
                  <p className="text-sm font-medium">No scores yet</p>
                  <p className="text-xs mt-1">Be the first to play!</p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {userLeaderboard.map((playerData, idx) => (
                    <li
                      key={`${playerData.username}-${idx}`}
                      className="flex items-center gap-3 group hover:scale-102 transition-transform duration-200"
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg font-bold text-lg shadow-md ${
                          idx === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                            : idx === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                            : idx === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                            : "bg-gradient-to-br from-blue-200 to-blue-400 text-[#090C9B]"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#090C9B] truncate">
                          {playerData.username}
                        </div>
                        {playerData.gamesPlayed && (
                          <div className="text-xs text-[#090C9B]/60">
                            {playerData.gamesPlayed} game
                            {playerData.gamesPlayed !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#090C9B] text-lg">
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
