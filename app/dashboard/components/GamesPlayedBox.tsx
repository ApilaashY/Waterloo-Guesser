import React from "react";

export default function GamesPlayedBox({ value }: { value: number }) {
  return (
    <div className="rounded-xl bg-gray-900 shadow-lg p-6 flex flex-col items-center justify-center border border-gray-800 hover:border-yellow-400 transition-all">
      <span className="text-4xl mb-2">🎮</span>
      <span className="text-xl font-semibold text-yellow-300 mb-1">Games Played</span>
      <span className="text-2xl font-bold text-white mb-2">{value}</span>
    </div>
  );
}
