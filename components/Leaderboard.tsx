"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import mockData from "../mock-data/mock-site-data.json";

type Player = {
  id: string;
  name: string;
  avatar: string | null;
  rank: number | null;
};

type Faculty = {
  name: string;
  imagePath: string;
  color: string;
  totalScore: number;
  players: Array<{ player: Player; score: number; rank: number | null }>;
};

export default function Leaderboard() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("Engineering");

  const players: Record<string, Player> = (mockData as any).players.reduce(
    (acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    },
    {}
  );

  const [facultyData, setFacultyData] = useState<
    Array<{ department: string; totalPoints: number }>
  >([]);
  const [userLeaderboard, setUserLeaderboard] = useState<
    Array<{ username: string; totalPoints: number }>
  >([]);

  useEffect(() => {
    try {
      fetch("/api/leaderboard/faculty", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setFacultyData(data);
        });
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
    try {
      fetch("/api/leaderboard/users", { method: "GET" })
        .then((res) => res.json())
        .then((data) => {
          setUserLeaderboard(data);
        });
    } catch (error) {
      console.error("Error fetching user leaderboard data:", error);
    }
  }, []);

  const facultySymbols: Record<string, { imagePath: string; color: string }> = {
    Engineering: {
      imagePath: "/Engineering-Symbol.png",
      color: "text-green-400",
    },
    Health: { imagePath: "/Health.png", color: "text-red-400" },
    Math: { imagePath: "/Math.png", color: "text-blue-400" },
    Environment: {
      imagePath: "/Environment-Symbol.png",
      color: "text-yellow-400",
    },
    Arts: { imagePath: "/Art-Symbol.png", color: "text-purple-400" },
    Science: { imagePath: "/Science-Symbol.png", color: "text-cyan-400" },
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Outer dark blurred container to match Hero */}
      <div className="relative rounded-2xl bg-black/60 backdrop-blur-lg border border-white/6 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-center mb-8">
          <h2 className="text-3xl font-bold text-white">Faculty Leaderboard</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Faculty Totals */}
          <div className="rounded-xl bg-white/5 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
              <span className="text-sm text-gray-300">Top faculties</span>
            </div>
            <ol className="space-y-4">
              {facultyData.map(
                (
                  faculty: { department: string; totalPoints: number },
                  id: number
                ) => (
                  <li
                    key={faculty.department}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedFaculty === faculty.department
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedFaculty(faculty.department)}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-tr from-yellow-400 to-orange-400 text-black font-bold">
                      {id + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {faculty.department}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-white">
                        {faculty.totalPoints}
                      </div>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>

          {/* Middle: Faculty Symbols */}
          <div className="flex flex-col items-center justify-center space-y-8">
            {Object.keys(facultySymbols).map((faculty) => (
              <button
                key={faculty}
                onClick={() => setSelectedFaculty(faculty)}
                className={`relative w-16 h-16 transition-all duration-300 hover:scale-110 ${
                  selectedFaculty === faculty
                    ? "scale-125 drop-shadow-lg"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <Image
                  src={facultySymbols[faculty].imagePath}
                  alt={`${faculty} Symbol`}
                  fill
                  className="object-contain filter invert brightness-200 contrast-200"
                />
              </button>
            ))}
          </div>

          {/* Right: Selected Faculty Players */}
          <div className="rounded-xl bg-white/5 p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
              <span className="text-sm text-gray-300">Top players</span>
            </div>
            <ol className="space-y-3">
              {userLeaderboard.map((playerData, idx) => (
                <li
                  key={playerData.username ?? `player-${idx}`}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-tr from-yellow-400 to-orange-400 text-black font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {playerData.username}
                      </div>
                      {/* <div className="text-sm text-gray-300">
                        Rank: {playerData.rank ?? "—"}
                      </div> */}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-white">
                        {playerData.totalPoints}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 text-sm text-gray-300">Updated: mock data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
