import Link from "next/link";

export default function CommunityCTA() {
    return (
        <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="relative rounded-2xl overflow-hidden">
                {/* Gradient border effect - Semantic */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary via-accent-soft to-accent-primary opacity-20" />
                <div className="absolute inset-[1px] bg-surface rounded-2xl" />

                {/* Content container */}
                <div className="relative">
                    {/* Atmospheric gradient background */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute -top-1/2 -right-1/4 w-[60%] h-[150%] bg-gradient-to-bl from-accent-primary/15 via-accent-soft/10 to-transparent rounded-full blur-[60px]" />
                        <div className="absolute -bottom-1/2 -left-1/4 w-[50%] h-[150%] bg-gradient-to-tr from-accent-primary/15 via-accent-soft/10 to-transparent rounded-full blur-[60px]" />
                    </div>

                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

                    <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/25">
                                    <svg className="w-5 h-5 text-root" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-secondary font-semibold text-xs uppercase tracking-widest">Community</span>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                                Know a hidden spot on campus?
                            </h3>
                            <p className="text-secondary leading-relaxed">
                                Submit your own photos to the community. If approved, players will try to crack your challenge.
                            </p>
                        </div>

                        <Link
                            href="/add-location"
                            className="group flex items-center gap-2 px-6 py-3.5 bg-accent-primary hover:bg-accent-primary/90 text-root font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-accent-primary/25 hover:shadow-accent-primary/40"
                        >
                            Submit a Photo
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
