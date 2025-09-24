interface HeroBackgroundProps {
  children: React.ReactNode;
}

export default function HeroBackground({ children }: HeroBackgroundProps) {
  return (
    <div className="bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 relative min-h-screen w-full overflow-hidden">
      {/* Border frame around the screen edges */}
      <div className="absolute inset-4 border-2 border-[#090C9B] rounded-lg z-30 pointer-events-none"></div>

      {/* All content passed as children */}
      {children}

      <div className="relative isolate px-6 pt-4 lg:pt-8 z-20">
        {/* Top gradient background effect */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-blue-200/40 to-blue-500/30 opacity-60 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        {/* Bottom gradient background effect */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-16rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+6rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-blue-400/30 to-blue-700/40 opacity-50 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>

      {/* UW GUESSER text at bottom right */}
      <div
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[100] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-wide pointer-events-none select-none text-amber-800"
        style={{ fontFamily: 'Felgine, sans-serif', color: '#090C9B'}}
      >
        UW GUESSER
      </div>
    </div>
  );
}
