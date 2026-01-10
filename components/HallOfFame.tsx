"use client";

import { useState } from "react";
import Link from "next/link";

interface HallOfFameProps {
    initialData: {
        hardest: any[];
        popular: any[];
    }
}

export default function HallOfFame({ initialData }: HallOfFameProps) {
    const [activeTab, setActiveTab] = useState<'hardest' | 'popular'>('hardest');

    const data = initialData || { hardest: [], popular: [] };
    const currentData = activeTab === 'hardest' ? data.hardest : data.popular;

    return (
        <div className="mx-auto max-w-5xl px-6">
            {/* Header */}
            <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase text-accent-primary bg-accent-primary/10 rounded-full border border-accent-primary/20">
                    Achievements
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-3 tracking-tight text-glow">
                    Hall of Fame
                </h2>
                <p className="text-secondary text-lg">The toughest challenges and community favorites</p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-3 mb-10">
                <button
                    onClick={() => setActiveTab('hardest')}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'hardest'
                        ? "bg-accent-primary text-root shadow-lg shadow-accent-primary/25"
                        : "bg-root/40 text-secondary hover:text-primary hover:bg-white/[0.06] border border-primary/10"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Hardest to Guess
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('popular')}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'popular'
                        ? "bg-accent-primary text-root shadow-lg shadow-accent-primary/25"
                        : "bg-root/40 text-secondary hover:text-primary hover:bg-white/[0.06] border border-primary/10"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Community Favorites
                    </span>
                </button>
            </div>

            {/* Content */}
            {currentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentData.map((item, index) => (
                        <div
                            key={item.id}
                            className="group relative rounded-xl overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-accent-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Subtle gradient overlay on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent-primary/[0.05] to-transparent" />

                            {/* Content */}
                            <div className="relative flex items-center gap-4 p-4">
                                {/* Rank */}
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-root text-base shadow-lg bg-accent-primary shadow-accent-primary/25">
                                    {index + 1}
                                </div>

                                {/* Image */}
                                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.1]">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-primary truncate">{item.name}</h3>
                                    {activeTab === 'hardest' ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-secondary">Avg. off by</span>
                                            <span className="text-accent-primary font-medium">{item.avgDistance}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-secondary">Played</span>
                                            <span className="text-primary font-medium">{item.totalPlays} times</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar for hardest */}
                                {activeTab === 'hardest' && (
                                    <div className="w-16 h-1.5 bg-white/[0.1] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent-primary rounded-full"
                                            style={{ width: `${Math.min(100, (item.difficultyScore / 10) * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.08]">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/[0.1]">
                        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <p className="text-primary font-semibold text-lg">No stats available yet</p>
                    <p className="text-secondary mt-1">Play some games to populate the Hall of Fame</p>
                </div>
            )}
            {/* View All Button */}
            <div className="mt-10 text-center">
                <Link
                    href="/hall-of-fame"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-secondary hover:text-white hover:bg-white/[0.1] hover:border-accent-primary/50 transition-all duration-300 font-medium"
                >
                    <span>View All Entries</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
