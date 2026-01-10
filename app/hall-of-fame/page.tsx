"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trophy, Clock, Target, Activity } from "lucide-react";

interface StatRecord {
    username: string;
    distance?: number;
    score?: number;
    time?: number;
}

interface ImageStats {
    mostAccurate: StatRecord | null;
    fastestTime: StatRecord | null;
    totalGuesses: number;
    averageDistance: number;
}

interface FameImage {
    id: string;
    imageUrl: string;
    buildingName: string;
    stats: ImageStats;
}

export default function HallOfFame() {
    const [images, setImages] = useState<FameImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'picture' | 'person'>('picture');
    const limit = 12;

    useEffect(() => {
        fetchImages(page);
    }, [page]);

    const fetchImages = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/hall-of-fame?page=${pageNum}&limit=${limit}`);
            const data = await res.json();
            setImages(data.images);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Failed to load Hall of Fame:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-root text-primary selection:bg-accent-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-accent-primary/5 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-accent-soft/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <Link
                            href="/"
                            className="relative z-20 inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Campus
                        </Link>
                        {/* Fixed Title: Removed transparent/bg-clip-text which caused blur with text-shadow */}
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary tracking-tight text-glow">
                            Hall of Fame
                        </h1>
                        <p className="text-secondary font-data mt-2">
                            Legends of the campus. Can you beat their records?
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="flex p-1 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('picture')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'picture'
                                ? 'bg-accent-primary text-root shadow-lg'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            Picture Stats
                        </button>
                        <button
                            onClick={() => setViewMode('person')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'person'
                                ? 'bg-accent-primary text-root shadow-lg'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            Person Stats
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20 hover:border-accent-primary/50 transition-colors duration-500"
                            >
                                {/* Image */}
                                <Image
                                    src={img.imageUrl}
                                    alt="Location"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-sm"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center p-6 backdrop-blur-sm">
                                    <h3 className="text-lg font-heading font-bold text-white mb-4 text-center text-glow">{img.buildingName}</h3>

                                    {img.stats.mostAccurate ? (
                                        <div className="space-y-4 font-data text-sm">
                                            {viewMode === 'person' ? (
                                                <>
                                                    {/* PERSON STATS */}
                                                    <div className="flex items-start gap-3">
                                                        <Target className="w-5 h-5 text-emerald-400 shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-secondary uppercase tracking-wider">Top Sniper</p>
                                                            <p className="text-primary font-bold">{img.stats.mostAccurate.username}</p>
                                                            <p className="text-emerald-400">{Math.round(img.stats.mostAccurate.distance || 0)}m</p>
                                                        </div>
                                                    </div>

                                                    {img.stats.fastestTime && (
                                                        <div className="flex items-start gap-3">
                                                            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-secondary uppercase tracking-wider">Speed Demon</p>
                                                                <p className="text-primary font-bold">{img.stats.fastestTime.username}</p>
                                                                <p className="text-amber-400">{(img.stats.fastestTime.time || 0) / 1000}s</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {/* PICTURE STATS */}
                                                    <div className="flex items-start gap-3">
                                                        <Activity className="w-5 h-5 text-accent-primary shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-secondary uppercase tracking-wider">Avg. Accuracy</p>
                                                            <p className="text-accent-primary font-bold">{Math.round(img.stats.averageDistance)}m</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <Trophy className="w-5 h-5 text-indigo-400 shrink-0" />
                                                        <div>
                                                            <p className="text-xs text-secondary uppercase tracking-wider">Popularity</p>
                                                            <p className="text-primary font-bold">{img.stats.totalGuesses} attempts</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <Trophy className="w-12 h-12 text-white/20 mx-auto" />
                                            <p className="text-primary font-bold text-lg">Unconquered</p>
                                            <p className="text-secondary text-sm">Be the first to claim this territory!</p>
                                            <Link
                                                href="/game"
                                                className="inline-block mt-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white text-sm font-bold rounded-lg transition-colors"
                                            >
                                                Play Now
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-12 flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-secondary hover:text-primary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-secondary font-data">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-secondary hover:text-primary hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </main>
    );
}
