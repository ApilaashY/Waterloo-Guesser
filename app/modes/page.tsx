"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Users, Triangle, GraduationCap, Lock, Shield, Sparkles } from "lucide-react";

const GAME_MODES = [
	{
		label: "Single Player",
		value: "normal",
		enabled: true,
		icon: Gamepad2,
		description: "Standard solo play"
	},
	{
		label: "Multiplayer 1v1",
		value: "versus",
		enabled: true,
		icon: Users,
		description: "Head-to-head battle"
	},
	{
		label: "Triangle Challenge",
		value: "triangle",
		enabled: true,
		icon: Triangle,
		description: "Guess the centroid"
	},
	{
		label: "Tutorial",
		value: "tutorial",
		enabled: true,
		icon: GraduationCap,
		description: "Learn the ropes"
	},
	{
		label: "Team Battle",
		value: "teams",
		enabled: false,
		icon: Users,
		description: "Squad up (Coming Soon)"
	},
	{
		label: "Ranked",
		value: "ranked",
		enabled: false,
		icon: Shield,
		description: "Competitive ladder (2026)"
	},
	{
		label: "Private Match",
		value: "private",
		enabled: false,
		icon: Lock,
		description: "Invite only"
	}
];

const Modifiers = [
	{ label: "No Modifiers", value: "none" },
	{ label: "Speed Rush", value: "timed", description: "Speed matters! Score bonus points for quick guesses" },
	{ label: "90s Retro Style", value: "grayscale" },
	{ label: "Spectra Inversion", value: "inverted-colors" },
	{ label: "Random Chaos", value: "random" },
];

const TOOLTIP_TEXT = {
	normal: "Play solo and test your knowledge of the UW campus at your own pace.",
	versus: "Challenge another player head-to-head in real-time competition.",
	triangle: "View 3 photos forming a triangle and guess what's inside! Find the centroid.",
	teams: "Team up with friends and compete against other teams.",
	ranked: "Competitive mode with rankings. Coming soon.",
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

		const queryParams = new URLSearchParams();
		if (selectedModifier !== "none") {
			queryParams.set("modifier", selectedModifier);
		}
		if (mode !== "normal") {
			queryParams.set("mode", mode);
		}
		const queryString = queryParams.toString();
		const queryPart = queryString ? `?${queryString}` : "";

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

	return (
		<main className="min-h-screen bg-root text-primary selection:bg-accent-primary/30 flex items-center justify-center relative overflow-hidden p-6">
			{/* Background Effects */}
			<div className="fixed inset-0 pointer-events-none">
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-soft/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
				<div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
			</div>

			<div className="w-full max-w-lg relative z-10">
				{/* Back Link */}
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8 group"
				>
					<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
					Back to Campus
				</Link>

				<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-heading font-bold text-primary mb-2 text-glow">
							Select Game Mode
						</h1>
						<p className="text-secondary font-data text-sm">
							Choose your challenge
						</p>
					</div>

					{/* Modifiers */}
					<div className="mb-8">
						<label className="block text-xs font-bold text-accent-primary uppercase tracking-widest mb-3 flex items-center gap-2">
							<Sparkles className="w-3 h-3" />
							Game Modifiers
						</label>
						<div className="relative">
							<select
								value={selectedModifier}
								onChange={(e) => setSelectedModifier(e.target.value)}
								className="w-full bg-black/20 text-primary border border-white/10 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-accent-primary transition-colors font-data text-sm hover:bg-black/30 cursor-pointer"
							>
								{Modifiers.map((modifier) => (
									<option key={modifier.value} value={modifier.value} className="bg-root text-primary">
										{modifier.label}
									</option>
								))}
							</select>
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</div>

					{/* Modes List */}
					<div className="space-y-3">
						{GAME_MODES.map((mode) => {
							const Icon = mode.icon;
							return (
								<div key={mode.value} className="relative group/mode">
									<button
										onClick={() => handleSelect(mode.value, mode.enabled)}
										onMouseEnter={() => setHoveredMode(mode.value)}
										onMouseLeave={() => setHoveredMode(null)}
										disabled={!mode.enabled}
										className={`w-full p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden ${mode.enabled
												? "bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-accent-primary/40 hover:shadow-[0_0_15px_-3px_rgba(56,64,93,0.3)]"
												: "opacity-40 bg-black/10 border-transparent cursor-not-allowed grayscale"
											}`}
									>
										<div className="flex items-center gap-4 relative z-10">
											<div className={`p-2 rounded-lg ${mode.enabled ? 'bg-accent-primary/10 text-accent-primary' : 'bg-white/5 text-secondary'}`}>
												<Icon className="w-5 h-5" />
											</div>
											<div>
												<h3 className={`font-semibold ${mode.enabled ? 'text-primary' : 'text-secondary'}`}>
													{mode.label}
												</h3>
												<p className="text-xs text-secondary/70 font-data mt-0.5">
													{mode.description}
												</p>
											</div>
											{!mode.enabled && (
												<Lock className="w-4 h-4 text-secondary ml-auto opacity-50" />
											)}
										</div>
									</button>

									{/* Tooltip */}
									{hoveredMode === mode.value && mode.enabled && (
										<div className={`absolute z-20 w-64 pointer-events-none ${isMobile
												? 'bottom-full left-1/2 -translate-x-1/2 mb-3'
												: 'left-full top-1/2 -translate-y-1/2 ml-4'
											}`}>
											<div className="bg-surface/95 backdrop-blur-md text-primary p-4 rounded-xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
												<p className="text-sm leading-relaxed text-secondary/90">
													{TOOLTIP_TEXT[mode.value as keyof typeof TOOLTIP_TEXT]}
												</p>
												{/* Arrow */}
												<div className={`absolute w-3 h-3 bg-surface/95 border-l border-b border-white/10 rotate-45 ${isMobile
														? 'bottom-[-6px] left-1/2 -translate-x-1/2'
														: 'left-[-6px] top-1/2 -translate-y-1/2 border-l border-t border-b-0 border-r-0'
													}`} />
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</main>
	);
}
