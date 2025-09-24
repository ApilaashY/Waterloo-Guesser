"use client";

import { useRouter } from "next/navigation";
import React from "react";

const GAME_MODES = [
	{ label: "Normal", value: "normal" },
	{ label: "Multiplayer 1 on 1", value: "versus" },
	{ label: "Multiplayer Teams", value: "teams" },
	{ label: "Ranked", value: "ranked" },
	{ label: "Tutorial", value: "tutorial" },
    { label: "Practice", value: "practice" },
    { label: "Private", value: "private" }
];

const Modifiers = [
    { label: "No Modifiers", value: "none" },
    { label: "90s Style", value: "grayscale" },
    { label: "Flash", value: "1-second" },
    { label: "Spectra Inversion", value: "inverted-colors" },
    { label: "Random Modifiers", value: "random" },
];

export default function ModesPage() {
	const router = useRouter();

	const handleSelect = (mode: string) => {
		// You can pass mode info via query string if needed
		router.push("/game");
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold mb-6 text-center">Select Game Mode</h1>
				<div className="space-y-4">
					{GAME_MODES.map((mode) => (
						<button
							key={mode.value}
							className="w-full py-3 px-4 rounded-lg bg-yellow-600 text-white font-semibold text-lg hover:bg-blue-700 transition"
							onClick={() => handleSelect(mode.value)}
						>
							{mode.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
