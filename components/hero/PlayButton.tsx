import Link from "next/link";

interface PlayButtonProps {
  animationComplete: boolean;
  size?: "desktop" | "mobile";
}

export default function PlayButton({ animationComplete, size = "desktop" }: PlayButtonProps) {
  const isDesktop = size === "desktop";
  const iconSize = isDesktop ? 64 : 56;
  const containerSize = isDesktop ? "w-16 h-16" : "w-14 h-14";
  const textSize = isDesktop ? "text-xs sm:text-sm" : "text-sm";
  const textOpacity = isDesktop ? "opacity-0 group-hover:opacity-100" : "";

  return (
    <Link href="/modes">
      <button
        className={`group relative transition-all duration-500 ${
          size === "desktop" 
            ? (animationComplete
                ? "opacity-100 scale-100"
                : "opacity-0 scale-75 pointer-events-none")
            : "p-2"
        }`}
      >
        <div className="relative flex flex-col items-center justify-center">
          <div className={`${containerSize} flex items-center justify-center`}>
            <svg
              width={iconSize}
              height={iconSize}
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`group-hover:scale-110 transition-transform duration-300 relative z-10 ${isDesktop ? 'play-button' : ''}`}
            >
              <polygon
                points="25,15 65,40 25,65"
                fill="#090C9B"
                className="group-hover:fill-[#d97f40] transition-colors duration-300"
              />
            </svg>
          </div>
          <div className={`mt-${isDesktop ? '1 sm:mt-2' : '2'} text-[#090C9B] ${textSize} font-semibold ${textOpacity} transition-opacity duration-300 relative z-10`}>
            Play
          </div>
        </div>
      </button>
    </Link>
  );
}
