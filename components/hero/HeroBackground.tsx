interface HeroBackgroundProps {
  children: React.ReactNode;
}

export default function HeroBackground({ children }: HeroBackgroundProps) {
  return (
    <div className="bg-root relative min-h-screen w-full overflow-hidden">
      {/* Cohesive atmospheric gradient layers - Twilight Indigo palette */}
      <div className="absolute inset-0">
        {/* Primary indigo glow - top left */}
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-accent-primary/20 via-accent-soft/10 to-transparent rounded-full blur-[120px]" />

        {/* Secondary indigo accent - bottom right */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-gradient-to-tl from-accent-primary/15 via-accent-soft/8 to-transparent rounded-full blur-[100px]" />

        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-gradient-to-r from-accent-soft/8 via-accent-primary/5 to-accent-soft/8 rounded-full blur-[80px]" />
      </div>

      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Refined border frame - unified accent color */}
      <div className="absolute inset-4 border border-white/[0.06] rounded-2xl z-30 pointer-events-none">
        {/* Corner accents - all using accent-primary */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent-primary/30 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent-primary/30 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent-primary/30 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent-primary/30 rounded-br-2xl" />
      </div>

      {/* All content passed as children */}
      {children}

      <div className="relative isolate px-6 pt-4 lg:pt-8 z-20">
        {/* Top gradient background effect - refined with indigo tones */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-accent-primary/15 via-accent-soft/10 to-transparent opacity-60 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        {/* Bottom gradient background effect - refined */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-16rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+6rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-accent-soft/15 via-accent-primary/10 to-transparent opacity-50 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>

      {/* UW GUESSER text at bottom right - refined styling */}
      <div
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 md:bottom-10 md:right-10 z-[100] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-wide pointer-events-none select-none"
        style={{ fontFamily: 'Felgine, sans-serif' }}
      >
        <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-lg">
          UW GUESSER
        </span>
      </div>
    </div>
  );
}

