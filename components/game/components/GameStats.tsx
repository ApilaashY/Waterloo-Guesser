import React from 'react';

interface GameStatsProps {
    score: number;
    round: number;
    maxRounds: number;
    onHomeClick: () => void;
}

export default function GameStats({ score, round, maxRounds, onHomeClick }: GameStatsProps) {
    return (
        <div className="flex justify-between items-start w-full">
            <div className="flex gap-2">
                <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-4 py-1 text-base font-bold text-gray-800">
                    Points: {score}
                </div>
                <div className="bg-white rounded-lg border-2 border-gray-300 shadow px-4 py-1 text-base font-bold text-gray-800">
                    Round: {round} / {maxRounds}
                </div>
            </div>

            <button
                className="bg-white rounded-lg border-2 border-gray-300 shadow flex items-center justify-center w-10 h-10 hover:bg-gray-100"
                onClick={onHomeClick}
                aria-label="Go to homepage"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M3 9.5L12 3l9 6.5" />
                    <path d="M4 10v10a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1V10" />
                </svg>
            </button>
        </div>
    );
}
