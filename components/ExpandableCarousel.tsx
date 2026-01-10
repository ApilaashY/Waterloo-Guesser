"use client";

import { useState } from "react";

interface CarouselItem {
    id: string;
    name: string;
    imageUrl: string;
    description?: string;
}

interface ExpandableCarouselProps {
    items: CarouselItem[];
    height?: string;
}

export default function ExpandableCarousel({ items, height = "h-[500px]" }: ExpandableCarouselProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <div className={`w-full ${height} flex flex-row gap-1 overflow-hidden rounded-xl`}>
            {items.map((item) => {
                const isActive = activeId === item.id;

                return (
                    <div
                        key={item.id}
                        className={`
                            relative flex-1 cursor-pointer overflow-hidden rounded-xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                            ${isActive ? "flex-[5]" : "hover:flex-[2.5]"}
                            group
                        `}
                        onMouseEnter={() => setActiveId(item.id)}
                        onMouseLeave={() => setActiveId(null)}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient overlay - refined dark theme */}
                            <div className={`absolute inset-0 transition-all duration-500 ${
                                isActive
                                    ? 'bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent'
                                    : 'bg-gradient-to-t from-[#0a0f1a]/90 via-[#0a0f1a]/40 to-transparent group-hover:from-[#0a0f1a]/95'
                            }`} />

                            {/* Accent glow on active */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/10 via-transparent to-transparent" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                            <div className="transition-all duration-500">
                                {/* Number badge - refined */}
                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] text-white/60 text-xs font-mono mb-3 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                    {item.id}
                                </div>

                                {/* Title */}
                                <h3 className={`text-white font-semibold transition-all duration-500 ${
                                    isActive ? "text-2xl" : "text-sm truncate"
                                }`}>
                                    {item.name}
                                </h3>

                                {/* Description */}
                                <div className={`overflow-hidden transition-all duration-700 ${isActive ? "max-h-32 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {item.description || "Explore this iconic location on campus."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Accent line - teal gradient */}
                        <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-cyan-400 to-violet-500 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

                        {/* Corner accent on hover */}
                        <div className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                );
            })}
        </div>
    );
}
