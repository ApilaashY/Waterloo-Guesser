// Dashboard Bento Box Layout for a User (Mock Data)

import React from "react";
// @ts-ignore
const mockData = require("@/mock-data/mock-site-data.json");

import RankBox from "./components/RankBox";
import GamesPlayedBox from "./components/GamesPlayedBox";
import WinsBox from "./components/WinsBox";
import LossesBox from "./components/LossesBox";
import BestScoreBox from "./components/BestScoreBox";
import LongestStreakBox from "./components/LongestStreakBox";
import StreakConsistencyBox from "./components/StreakConsistencyBox";

const user = mockData.players[0]; // Anna Lee as sample user

export default function DashboardPage() {
	return (
		<main className="min-h-screen bg-gray-950 flex flex-col items-center py-10">
			<h1 className="text-3xl font-bold text-yellow-400 mb-6">Welcome, {user.name}</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl px-4">
				<RankBox value={user.rank} />
				<GamesPlayedBox value={user.stats.gamesPlayed} />
				<WinsBox value={user.stats.wins} />
				<LossesBox value={user.stats.losses} />
				<BestScoreBox value={user.stats.bestScore} />
				<LongestStreakBox value={user.stats.longestStreak} />
				<StreakConsistencyBox streak={user.stats.longestStreak} />
			</div>
		</main>
	);
}
