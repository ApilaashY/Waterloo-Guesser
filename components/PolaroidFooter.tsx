"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const FOOTER_LINKS = {
    features: [
        { name: "Play", href: "/" },
        { name: "Versus", href: "/versus" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Lore", href: "/lore" },
    ],
    explore: [
        { name: "Poster Board", href: "/poster-board" },
        { name: "Submit Photo", href: "/add-location" },
        { name: "Tutorial", href: "/tutorial" },
    ],
    socials: [
        { name: "Github", href: "https://github.com/ApilaashY/Waterloo-Guesser" },
    ],
};

// Layout configuration for the polaroids (relative positions within a grid)
const POLAROID_ROTATIONS = [-4, 3, -2, 5, -3];

interface PolaroidImage {
    src: string;
    alt: string;
    rotate: number;
}

export default function PolaroidFooter() {
    const [polaroids, setPolaroids] = useState<PolaroidImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuildingImages = async () => {
            try {
                // Fetch 5 random building images from the game's base_locations
                const fetchedImages: PolaroidImage[] = [];
                const usedIds: string[] = [];

                for (let i = 0; i < 5; i++) {
                    const response = await fetch('/api/getPhoto', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ previousCodes: usedIds }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.image) {
                            usedIds.push(data.id);
                            fetchedImages.push({
                                src: data.image,
                                alt: `Campus location ${i + 1}`,
                                rotate: POLAROID_ROTATIONS[i],
                            });
                        }
                    }
                }

                if (fetchedImages.length > 0) {
                    setPolaroids(fetchedImages);
                }
            } catch (error) {
                console.error("Failed to fetch footer images:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBuildingImages();
    }, []);

    return (
        <footer className="relative bg-root overflow-hidden">
            {/* Atmospheric gradient orbs */}
            <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">

                {/* Top Section: Heading + Polaroid Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 lg:mb-24">

                    {/* Left: Heading */}
                    <div className="max-w-lg">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight tracking-tight mb-6">
                            Explore the campus.
                            <br />
                            <span className="text-secondary">Discover hidden gems.</span>
                        </h2>
                        <p className="text-secondary text-lg leading-relaxed">
                            Join the Waterloo Guesser community. Upload your own campus finds, challenge friends to beat your location knowledge, and climb the leaderboards.
                        </p>
                    </div>

                    {/* Right: Polaroid Gallery (Non-overlapping) */}
                    <div className="flex items-center justify-center lg:justify-end">
                        {!loading && polaroids.length > 0 ? (
                            <div className="flex flex-wrap gap-4 justify-center">
                                {polaroids.map((img, index) => (
                                    <div
                                        key={index}
                                        className="w-28 h-36 lg:w-36 lg:h-48 bg-surface p-1.5 pb-6 shadow-xl shadow-black/30 transition-transform duration-300 hover:scale-110 hover:z-10"
                                        style={{ transform: `rotate(${img.rotate}deg)` }}
                                    >
                                        <div className="w-full h-full relative overflow-hidden bg-black/20">
                                            <Image
                                                src={img.src}
                                                alt={img.alt}
                                                fill
                                                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                                sizes="(max-width: 768px) 112px, 144px"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-secondary text-sm italic">Loading campus photos...</div>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Links & Branding */}
                <div className="pt-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="text-primary font-bold text-lg mb-4">Waterloo Guesser</div>
                            <p className="text-secondary text-sm">
                                Made with care for the UWaterloo community.
                            </p>
                        </div>

                        {/* Features */}
                        <div>
                            <h4 className="text-secondary uppercase tracking-widest text-[10px] font-semibold mb-4">Features</h4>
                            <ul className="flex flex-col gap-2">
                                {FOOTER_LINKS.features.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-primary text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="text-secondary uppercase tracking-widest text-[10px] font-semibold mb-4">Explore</h4>
                            <ul className="flex flex-col gap-2">
                                {FOOTER_LINKS.explore.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-primary text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Socials */}
                        <div>
                            <h4 className="text-secondary uppercase tracking-widest text-[10px] font-semibold mb-4">Connect</h4>
                            <ul className="flex flex-col gap-2">
                                {FOOTER_LINKS.socials.map(link => (
                                    <li key={link.name}>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:text-white transition-colors">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
