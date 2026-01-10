"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

// Faculty configuration with colors
const facultySymbols = {
    Engineering: {
        imagePath: "/Engineering-Symbol.png",
        color: "from-purple-500 to-violet-600",
        glowColor: "shadow-purple-500/30",
        description: "Innovation & Design",
        themeColor: "#8b5cf6",
        themeDark: "#1a1033",
    },
    Health: {
        imagePath: "/Health.png",
        color: "from-teal-500 to-cyan-600",
        glowColor: "shadow-teal-500/30",
        description: "Well-being & Life",
        themeColor: "#14b8a6",
        themeDark: "#0a1f1e",
    },
    Mathematics: {
        imagePath: "/Math.png",
        color: "from-pink-500 to-rose-600",
        glowColor: "shadow-pink-500/30",
        description: "Logic & Computation",
        themeColor: "#ec4899",
        themeDark: "#1f0a14",
    },
    Environment: {
        imagePath: "/Environment-Symbol.png",
        color: "from-green-500 to-emerald-600",
        glowColor: "shadow-green-500/30",
        description: "Sustainability & Future",
        themeColor: "#22c55e",
        themeDark: "#0a1f10",
    },
    Arts: {
        imagePath: "/Art-Symbol.png",
        color: "from-orange-500 to-amber-600",
        glowColor: "shadow-orange-500/30",
        description: "Creativity & Culture",
        themeColor: "#f97316",
        themeDark: "#1f120a",
    },
    Science: {
        imagePath: "/Science-Symbol.png",
        color: "from-blue-500 to-indigo-600",
        glowColor: "shadow-blue-500/30",
        description: "Discovery & Research",
        themeColor: "#3b82f6",
        themeDark: "#0f1629",
    },
};

type AnimationPhase = "idle" | "emerging" | "contracting" | "expanding" | "fading" | "complete";

// 4-pointed star SVG with smooth transitions
const FourPointStar = ({
    color,
    scale,
    opacity,
    transitionDuration
}: {
    color: string;
    scale: number;
    opacity: number;
    transitionDuration: string;
}) => (
    <svg
        viewBox="0 0 100 100"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
            width: `${scale * 100}vmax`,
            height: `${scale * 100}vmax`,
            opacity,
            transition: `all ${transitionDuration} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
    >
        <path
            d="M 50 0 
               C 50 35, 35 50, 0 50 
               C 35 50, 50 65, 50 100 
               C 50 65, 65 50, 100 50 
               C 65 50, 50 35, 50 0 Z"
            fill={color}
        />
    </svg>
);

export default function FacultyShowcase() {
    const [hoveredFaculty, setHoveredFaculty] = useState<string | null>(null);
    const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle");
    const [activeFaculty, setActiveFaculty] = useState<string | null>(null);
    const [starScale, setStarScale] = useState(0);
    const [starOpacity, setStarOpacity] = useState(0);
    const [transitionDuration, setTransitionDuration] = useState("600ms");
    const [pulsingFaculty, setPulsingFaculty] = useState<string | null>(null);

    // Handle animation phases
    useEffect(() => {
        // Phase 1: Star fades in and grows to a small size
        if (animationPhase === "emerging") {
            setTransitionDuration("600ms");
            setStarScale(0.15);
            setStarOpacity(1);

            const timer = setTimeout(() => {
                setAnimationPhase("contracting");
            }, 650);
            return () => clearTimeout(timer);
        }

        // Phase 2: Tiny zoom out (breathing effect)
        if (animationPhase === "contracting") {
            setTransitionDuration("300ms");
            setStarScale(0.12);

            const timer = setTimeout(() => {
                setAnimationPhase("expanding");
            }, 350);
            return () => clearTimeout(timer);
        }

        // Phase 3: Smooth zoom in to cover screen
        if (animationPhase === "expanding") {
            setTransitionDuration("800ms");
            setStarScale(4);
            setStarOpacity(1);

            // Apply theme during expansion
            const themeTimer = setTimeout(() => {
                if (activeFaculty) {
                    const faculty = facultySymbols[activeFaculty as keyof typeof facultySymbols];
                    if (faculty) {
                        const root = document.documentElement;
                        root.style.setProperty('--accent-primary', faculty.themeColor);
                        root.style.setProperty('--color-accent-primary', faculty.themeColor);
                    }
                }
            }, 400);

            const nextPhaseTimer = setTimeout(() => {
                setAnimationPhase("fading");
            }, 850);

            return () => {
                clearTimeout(themeTimer);
                clearTimeout(nextPhaseTimer);
            };
        }

        // Phase 4: Fade out the star
        if (animationPhase === "fading") {
            setTransitionDuration("500ms");
            setStarOpacity(0);

            const timer = setTimeout(() => {
                setAnimationPhase("complete");
            }, 550);
            return () => clearTimeout(timer);
        }

        // Phase 5: Reset
        if (animationPhase === "complete") {
            const timer = setTimeout(() => {
                setAnimationPhase("idle");
                setPulsingFaculty(null);
                setStarScale(0);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [animationPhase, activeFaculty]);

    const handleFacultyClick = useCallback((faculty: string) => {
        if (animationPhase !== "idle") return;

        setActiveFaculty(faculty);
        setPulsingFaculty(faculty);
        setAnimationPhase("emerging");
    }, [animationPhase]);

    const activeColor = activeFaculty
        ? facultySymbols[activeFaculty as keyof typeof facultySymbols]?.themeColor
        : "#8b5cf6";

    return (
        <section className="relative py-24 overflow-hidden">
            {/* 4-Pointed Star Overlay */}
            {animationPhase !== "idle" && animationPhase !== "complete" && (
                <div className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center overflow-hidden">
                    <FourPointStar
                        color={activeColor}
                        scale={starScale}
                        opacity={starOpacity}
                        transitionDuration={transitionDuration}
                    />
                </div>
            )}

            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-accent-primary/10 via-transparent to-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 mb-4 text-xs font-data font-bold tracking-[0.2em] uppercase text-accent-primary bg-accent-primary/5 rounded-full border border-accent-primary/20 shadow-[0_0_10px_-2px_var(--accent-primary)]">
                        Choose Your Path
                    </span>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4 tracking-tight text-glow">
                        The Six Faculties
                    </h2>
                    <p className="text-secondary text-lg font-data max-w-2xl mx-auto">
                        Click a faculty to transform the site into their colors.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                    {Object.entries(facultySymbols).map(([name, data]) => (
                        <button
                            key={name}
                            onClick={() => handleFacultyClick(name)}
                            onMouseEnter={() => setHoveredFaculty(name)}
                            onMouseLeave={() => setHoveredFaculty(null)}
                            className="group relative flex flex-col items-center focus:outline-none"
                            disabled={animationPhase !== "idle"}
                        >
                            {/* Symbol Container */}
                            <div
                                className={`
                                    relative w-full aspect-square p-4
                                    flex items-center justify-center 
                                    transition-all duration-500 ease-out
                                    group-hover:-translate-y-4 group-hover:scale-110
                                    ${pulsingFaculty === name ? 'scale-110' : ''}
                                `}
                            >
                                {/* Back Glow / Halo */}
                                <div
                                    className={`
                                        absolute inset-0 rounded-full blur-2xl transition-opacity duration-500
                                        bg-gradient-to-br ${data.color}
                                    `}
                                    style={{ opacity: hoveredFaculty === name || pulsingFaculty === name ? 0.5 : 0 }}
                                />

                                {/* Icon */}
                                <div className="relative w-24 h-24 md:w-32 md:h-32 transition-transform duration-500 z-10">
                                    <Image
                                        src={data.imagePath}
                                        alt={`${name} Symbol`}
                                        fill
                                        className={`
                                            object-contain transition-all duration-500
                                            ${hoveredFaculty === name || pulsingFaculty === name
                                                ? 'brightness-100 drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]'
                                                : 'brightness-0 invert opacity-50'}
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Label below */}
                            <div className="mt-2 text-center">
                                <h3
                                    className={`
                                        text-lg font-heading font-bold transition-colors duration-300
                                        ${hoveredFaculty === name ? 'text-primary text-glow scale-110' : 'text-primary/40'}
                                    `}
                                >
                                    {name}
                                </h3>
                                <p className={`
                                    text-xs font-data font-medium uppercase tracking-wider transition-all duration-300
                                    ${hoveredFaculty === name ? 'text-accent-primary/80 opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                                `}>
                                    {data.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
