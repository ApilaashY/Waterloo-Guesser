import { useEffect, useRef, useState } from "react";

function LogoStar({
  x,
  y,
  color,
  animationComplete,
  isHeroPage = false,
}: {
  x: number;
  y: number;
  color: string;
  animationComplete: boolean;
  isHeroPage?: boolean;
}) {
  console.log("LogoStar x:", x, "y:", y);

  // Position spokes relative to the logo center, accounting for the animation state
  const adjustedX = isHeroPage
    ? (animationComplete ? x * 0.125 : x * 0.25) // Scale for final vs initial position
    : x * 0.125; // Always use final position when not on hero page
  const adjustedY = isHeroPage
    ? (animationComplete
        ? y * 0.125 - (x != 0 ? (Math.abs(y) / y) * 6.25 : 0)
        : y * 0.285 - (x != 0 ? (Math.abs(y) / y) * 7.14 : 0))
    : y * 0.125 - (x != 0 ? (Math.abs(y) / y) * 6.25 : 0); // Always use final position when not on hero page

  return (
    <img
      src={"/1-spoke.png"}
      className={`absolute z-10 transition-all duration-1000 ${
        isHeroPage
          ? (animationComplete ? "h-4 w-3" : "h-7 w-5.2")
          : "h-4 w-3" // Always use final size when not on hero page
      }`}
      style={{
        left: `calc(50% + ${adjustedX}px)`,
        top: `calc(50% + ${adjustedY}px)`,
        transform: "translate(-50%, -50%)",
        filter: color,
      }}
      alt="Spoke"
    />
  );
}

export default function Logo({
  animationComplete,
  isHeroPage = false,
}: {
  animationComplete: boolean;
  isHeroPage?: boolean;
}) {
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoHeight, setLogoHeight] = useState<number>(0);
  const [logoWidth, setLogoWidth] = useState<number>(0);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateLogoDim = () => {
      if (logoRef.current) {
        setLogoHeight(logoRef.current.offsetHeight);
        setLogoWidth(logoRef.current.offsetWidth);
      }
    };

    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initialize window dimensions
    updateWindowDimensions();

    // Update height when image loads
    const logoElement = logoRef.current;
    if (logoElement) {
      if (logoElement.complete) {
        updateLogoDim();
      } else {
        logoElement.addEventListener("load", updateLogoDim);
      }
    }

    // Update height and window dimensions on resize
    window.addEventListener("resize", updateLogoDim);
    window.addEventListener("resize", updateWindowDimensions);

    return () => {
      if (logoElement) {
        logoElement.removeEventListener("load", updateLogoDim);
      }
      window.removeEventListener("resize", updateLogoDim);
      window.removeEventListener("resize", updateWindowDimensions);
    };
  }, []);

  const colorFilters = {
    coral:
      "brightness(0) saturate(100%) invert(45%) sepia(99%) saturate(2174%) hue-rotate(329deg) brightness(103%) contrast(101%)", // #ff5845
    darkGreen:
      "brightness(0) saturate(100%) invert(27%) sepia(16%) saturate(1065%) hue-rotate(95deg) brightness(95%) contrast(88%)", // #34584a
    teal: "brightness(0) saturate(100%) invert(46%) sepia(96%) saturate(1815%) hue-rotate(148deg) brightness(91%) contrast(101%)", // #039b9d
    magenta:
      "brightness(0) saturate(100%) invert(24%) sepia(85%) saturate(6009%) hue-rotate(293deg) brightness(104%) contrast(96%)", // #fb2fc4
    indigo:
      "brightness(0) saturate(100%) invert(29%) sepia(34%) saturate(1456%) hue-rotate(224deg) brightness(89%) contrast(92%)", // #694b8b
    brightBlue:
      "brightness(0) saturate(100%) invert(32%) sepia(96%) saturate(4515%) hue-rotate(226deg) brightness(98%) contrast(105%)", // #365cef
  } as const;

  // Final left offset in pixels (smaller value moves the logo further left)
  const finalLeftOffset = 32; // was 24, moved right slightly

  return (
    <div
      className="fixed z-40"
      style={{
        left: isHeroPage ? (animationComplete ? `${finalLeftOffset}px` : '50%') : `${finalLeftOffset}px`,
        top: isHeroPage ? (animationComplete ? '40px' : '50%') : '40px',
        transform: isHeroPage
          ? (animationComplete
              ? 'translate(0, 0) scale(1)'
              : 'translate(-50%, -50%) scale(1.2)')
          : 'translate(0, 0) scale(1)',
        transition: isHeroPage
          ? "transform 1.2s cubic-bezier(0.77,0,0.175,1), left 1.2s cubic-bezier(0.77,0,0.175,1), top 1.2s cubic-bezier(0.77,0,0.175,1)"
          : "none", // No transition when not on hero page
        width: animationComplete || !isHeroPage ? 'auto' : undefined,
        height: animationComplete || !isHeroPage ? 'auto' : undefined,
      }}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex items-center justify-center">
            <LogoStar
              x={-logoWidth}
              y={-logoHeight}
              color={colorFilters.brightBlue}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <LogoStar
              x={0}
              y={-logoHeight}
              color={colorFilters.coral}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <LogoStar
              x={logoWidth}
              y={-logoHeight}
              color={colorFilters.darkGreen}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <LogoStar
              x={-logoWidth}
              y={logoHeight}
              color={colorFilters.indigo}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <LogoStar
              x={0}
              y={logoHeight}
              color={colorFilters.magenta}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <LogoStar
              x={logoWidth}
              y={logoHeight}
              color={colorFilters.teal}
              animationComplete={animationComplete}
              isHeroPage={isHeroPage}
            />
            <img
              ref={logoRef}
              src="/UWguesser-logo-beige-spokeless.png"
              alt="UW Guesser Logo"
              className={`relative transition-all duration-1000 ${
                animationComplete
                  ? "h-20 w-auto"
                  : "h-36 w-auto sm:h-44 lg:h-52"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
