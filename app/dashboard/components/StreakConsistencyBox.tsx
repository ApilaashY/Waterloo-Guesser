import React from "react";

type StreakConsistencyBoxProps = {
  streak: number;
};

export default function StreakConsistencyBox({ streak }: StreakConsistencyBoxProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const dots = Array(daysInMonth).fill(false);
  for (let i = 0; i < streak && today - i > 0; i++) {
    dots[today - i - 1] = true;
  }

  const hours = streak * 8 + 5;
  const minutes = streak * 3 + 23;

  return (
    <div className="rounded-xl bg-gray-900 shadow-lg p-6 flex flex-col items-center justify-center border border-gray-800 hover:border-yellow-400 transition-all">
      <span className="text-3xl mb-2">🕒</span>
      <span className="text-xl font-semibold text-yellow-300 mb-1">{streak} Day Streak</span>
      <span className="text-md text-gray-200 mb-3">{hours} hours, {minutes} minutes</span>
      <div className={`grid grid-cols-10 gap-1 mt-2`}>
        {dots.map((filled, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full inline-block ${filled ? "bg-red-500" : "bg-red-200 opacity-40"} ${i === today - 1 ? "border-2 border-yellow-400" : ""}`}
            title={`Day ${i + 1}${i === today - 1 ? " (Today)" : ""}`}
          ></span>
        ))}
      </div>
    </div>
  );
}
