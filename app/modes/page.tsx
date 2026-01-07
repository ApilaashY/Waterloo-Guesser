"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const GAME_MODES = [
	{ label: "Single Player", value: "normal", enabled: true },
	{ label: "Multiplayer 1 on 1", value: "versus", enabled: true },
	{ label: "It's a triangle", value: "triangle", enabled: true },
	{ label: "Tutorial", value: "tutorial", enabled: true },
	{ label: "Multiplayer Teams", value: "teams", enabled: false },
	{ label: "Ranked", value: "ranked", enabled: false },
	{ label: "Practice", value: "practice", enabled: false },
	{ label: "Private", value: "private", enabled: false }
];

const Modifiers = [
	{ label: "No Modifiers", value: "none" },
	{ label: "90s Style", value: "grayscale" },
	// { label: "Flash", value: "1-second" },
	{ label: "Spectra Inversion", value: "inverted-colors" },
	{ label: "Random Modifiers", value: "random" },
	// { label: "thanks for playing more coming soon! (sleep-deprived dev)", value: "" }
];

const TOOLTIP_TEXT = {
	normal: "Play solo and test your knowledge of the UW campus at your own pace.",
	versus: "Challenge another player head-to-head in real-time competition.",
	triangle: "View 3 photos forming a triangle and guess what's inside! Bonus points for identifying the triangle vertices and finding the centroid.",
	teams: "Team up with friends and compete against other teams.",
	ranked: "Competitive mode with rankings. Coming soon, 2026.",
	tutorial: "Learn the basics and get familiar with the game mechanics.",
	practice: "Improve your skills without pressure.",
	private: "Invite friends, create your own team or play 1 on 1."
};


export default function ModesPage() {
	const router = useRouter();
	const [hoveredMode, setHoveredMode] = useState<string | null>(null);
	const [selectedModifier, setSelectedModifier] = useState<string>("none");
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleSelect = (mode: string, enabled: boolean) => {
		if (!enabled) return;

		// Build query params with modifier and mode
		const queryParams = new URLSearchParams();
		if (selectedModifier !== "none") {
			queryParams.set("modifier", selectedModifier);
		}
		if (mode !== "normal") {
			queryParams.set("mode", mode);
		}
		const queryString = queryParams.toString();
		const queryPart = queryString ? `?${queryString}` : "";

		// Route based on mode
		if (mode === "versus") {
			router.push(`/queue-game${queryPart}`);
		} else if (mode === "triangle") {
			router.push(`/game${queryPart}`);
		} else if (mode === "tutorial") {
			router.push(`/tutorial`);
		} else {
			router.push(`/game${queryPart}`);
		}
	};

	const getTooltipPosition = (mode: string) => {
		if (!isMobile) {
			// Desktop: show on the right side
			return "left-full top-1/2 transform -translate-y-1/2 ml-4";
		} else {
			// Mobile: show above the button
			return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
			<div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
				<h1 className="text-2xl font-bold mb-6 text-center">Select Game Mode</h1>

				{/* Modifiers Section */}
				<div className="mb-6">
					<h2 className="text-lg font-semibold mb-3 text-center">Game Modifiers</h2>
					<select
						value={selectedModifier}
						onChange={(e) => setSelectedModifier(e.target.value)}
						className="w-full py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
					>
						{Modifiers.map((modifier) => (
							<option key={modifier.value} value={modifier.value}>
								{modifier.label}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-4">
					{GAME_MODES.map((mode) => (
						<div key={mode.value} className="relative group">
							<button
								className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition relative flex items-center justify-center gap-2 ${mode.enabled
									? "bg-yellow-600 text-white hover:bg-blue-700 cursor-pointer"
									: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
									}`}
								onClick={(e) => {
									if (!mode.enabled) {
										e.preventDefault();
										return;
									}
									handleSelect(mode.value, mode.enabled);
								}}
								onMouseEnter={() => setHoveredMode(mode.value)}
								onMouseLeave={() => setHoveredMode(null)}
							>
								{mode.label}
								{!mode.enabled && (
									<svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
									</svg>
								)}
							</button>

							{/* Tooltip */}
							{hoveredMode === mode.value && (
								<div className={`absolute ${getTooltipPosition(mode.value)} z-50`}>
									<div className="relative px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs whitespace-normal">
										{TOOLTIP_TEXT[mode.value as keyof typeof TOOLTIP_TEXT]}
										{/* Arrow */}
										<div className={`absolute w-0 h-0 ${isMobile
											? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
											: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
											}`}></div>
									</div>
								</div>
							)}


						</div>
					))}
				</div>

			</div>
		</div>
	);
}
