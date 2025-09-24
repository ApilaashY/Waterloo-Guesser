import { useEffect, useRef, useState } from "react";

function LogoStar({
  x,
  y,
  color,
  animationComplete,
}: {
  x: number;
  y: number;
  color: string;
  animationComplete: boolean;
}) {
  console.log("LogoStar x:", x, "y:", y);

  // Keep the same relative positioning but scale proportionally when animation completes
  const adjustedX = animationComplete ? (x / 4) * 0.5 : x / 4;
  const adjustedY = animationComplete
    ? (y / 3.5 - (x != 0 ? (Math.abs(y) / y) * 25 : 0)) * 0.5
    : y / 3.5 - (x != 0 ? (Math.abs(y) / y) * 25 : 0);

  return (
    <img
      src={"/1-spoke.png"}
      className={`absolute z-10 transition-all duration-1000 ${
        animationComplete ? "h-4 w-3" : "h-7 w-5.2"
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
}: {
  animationComplete: boolean;
}) {
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoHeight, setLogoHeight] = useState<number>(0);
  const [logoWidth, setLogoWidth] = useState<number>(0);

  useEffect(() => {
    const updateLogoDim = () => {
      if (logoRef.current) {
        setLogoHeight(logoRef.current.offsetHeight);
        setLogoWidth(logoRef.current.offsetWidth);
      }
    };

    // Update height when image loads
    const logoElement = logoRef.current;
    if (logoElement) {
      if (logoElement.complete) {
        updateLogoDim();
      } else {
        logoElement.addEventListener("load", updateLogoDim);
      }
    }

    // Update height on window resize
    window.addEventListener("resize", updateLogoDim);

    return () => {
      if (logoElement) {
        logoElement.removeEventListener("load", updateLogoDim);
      }
      window.removeEventListener("resize", updateLogoDim);
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

  return (
    <div
      className="fixed left-1/2 top-1/2 z-40"
      style={{
        transform: animationComplete
          ? `translate(-${window.innerWidth / 2 - 40}px, -${
              window.innerHeight / 2 - 40
            }px) scale(1)`
          : "translate(-50%, -50%) scale(1.2)",
        transition:
          "transform 1.2s cubic-bezier(0.77,0,0.175,1), width 1.2s cubic-bezier(0.77,0,0.175,1), height 1.2s cubic-bezier(0.77,0,0.175,1)",
        width: animationComplete ? undefined : "auto",
        height: animationComplete ? undefined : "auto",
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
            />
            <LogoStar
              x={0}
              y={-logoHeight}
              color={colorFilters.coral}
              animationComplete={animationComplete}
            />
            <LogoStar
              x={logoWidth}
              y={-logoHeight}
              color={colorFilters.darkGreen}
              animationComplete={animationComplete}
            />
            <LogoStar
              x={-logoWidth}
              y={logoHeight}
              color={colorFilters.indigo}
              animationComplete={animationComplete}
            />
            <LogoStar
              x={0}
              y={logoHeight}
              color={colorFilters.magenta}
              animationComplete={animationComplete}
            />
            <LogoStar
              x={logoWidth}
              y={logoHeight}
              color={colorFilters.teal}
              animationComplete={animationComplete}
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
