"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const GAME_MODES = [
	{ label: "Single Player", value: "normal", enabled: true },
	{ label: "Multiplayer 1 on 1", value: "versus", enabled: true },
	{ label: "Multiplayer Teams", value: "teams", enabled: false },
	{ label: "Ranked", value: "ranked", enabled: false },
	{ label: "Tutorial", value: "tutorial", enabled: false },
    { label: "Practice", value: "practice", enabled: false },
    { label: "Private", value: "private", enabled: false }
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
	const [hoveredMode, setHoveredMode] = useState<string | null>(null);

	const handleSelect = (mode: string, enabled: boolean) => {
		if (!enabled) return;
		
		// You can pass mode info via query string if needed
		if (mode === "versus") {
			router.push("/queue-game");
		} else {
			router.push("/game");
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
				<h1 className="text-2xl font-bold mb-6 text-center">Select Game Mode</h1>
				<div className="space-y-4">
					{GAME_MODES.map((mode) => (
						<div key={mode.value} className="relative">
							<button
								className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition relative flex items-center justify-center gap-2 ${
									mode.enabled 
										? "bg-yellow-600 text-white hover:bg-blue-700 cursor-pointer" 
										: "bg-gray-300 text-gray-500 cursor-not-allowed"
								}`}
								onClick={() => handleSelect(mode.value, mode.enabled)}
								onMouseEnter={() => setHoveredMode(mode.enabled ? null : mode.value)}
								onMouseLeave={() => setHoveredMode(null)}
								disabled={!mode.enabled}
							>
								{mode.label}
								{!mode.enabled && (
									<svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
									</svg>
								)}
							</button>
							{hoveredMode === mode.value && (
								<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
									Coming soon next week
									<div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
