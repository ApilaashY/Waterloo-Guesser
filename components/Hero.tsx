"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./dialogFont.module.css";
import bgStyles from "./dialogBg.module.css";
import Link from "next/link";

const navigation = [
  { name: "Product", href: "#" },
  { name: "Features", href: "#" },
  { name: "Marketplace", href: "#" },
  { name: "Company", href: "#" },
];

const targetDate = new Date("2025-09-04T00:00:00");

function getTimeRemaining(endDate: Date) {
  const total = endDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function CountdownBox({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) {
    return (
      <div className="text-lg font-bold text-green-400">
        Countdown finished!
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center text-white text-lg">
      <div>
        <span className="font-bold text-2xl">{timeLeft.days}</span> d
      </div>
      <div>
        <span className="font-bold text-2xl">{timeLeft.hours}</span> h
      </div>
      <div>
        <span className="font-bold text-2xl">{timeLeft.minutes}</span> m
      </div>
      <div>
        <span className="font-bold text-2xl">{timeLeft.seconds}</span> s
      </div>
    </div>
  );
}

function LogoStar({ x, y, color }: { x: number; y: number; color: string }) {
  console.log("LogoStar x:", x, "y:", y);
  return (
    <img
      src={"/1-spoke.png"}
      className="absolute h-6 w-4.48695652 z-10 transition-all duration-300"
      style={{
        left: `calc(50% + ${x / 4}px)`,
        top: `calc(50% + ${y / 3.5 - (x != 0 ? (Math.abs(y) / y) * 25 : 0)}px)`,
        transform: "translate(-50%, -50%)",
        transition: "left 0.2s ease, top 0.2s ease",
        filter: color,
      }}
      alt="Spoke"
    />
  );
}

export default function Hero() {
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoHeight, setLogoHeight] = useState<number>(0);
  const [logoWidth, setLogoWidth] = useState<number>(0);

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

  return (
    <div className="bg-gradient-to-br from-black via-slate-900 to-purple-900 relative min-h-screen w-full overflow-hidden">
      {/* Border frame around the screen edges */}
      <div className="absolute inset-4 border-2 border-[#ede7d1] rounded-lg z-30 pointer-events-none"></div>

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
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-purple-500/50 to-violet-400/60 opacity-80 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        {/* Main content - centered logo */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="relative flex items-center justify-center">
                <LogoStar
                  x={-logoWidth}
                  y={-logoHeight}
                  color={colorFilters.brightBlue}
                />
                <LogoStar x={0} y={-logoHeight} color={colorFilters.coral} />
                <LogoStar
                  x={logoWidth}
                  y={-logoHeight}
                  color={colorFilters.darkGreen}
                />
                <LogoStar
                  x={-logoWidth}
                  y={logoHeight}
                  color={colorFilters.indigo}
                />
                <LogoStar x={0} y={logoHeight} color={colorFilters.magenta} />
                <LogoStar
                  x={logoWidth}
                  y={logoHeight}
                  color={colorFilters.teal}
                />
                <img
                  ref={logoRef}
                  src="/UWguesser-logo-beige-spokeless.png"
                  alt="UW Guesser Logo"
                  className="h-32 w-auto sm:h-40 lg:h-48 relative"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient background effect */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-gradient-to-tr from-indigo-500/40 to-purple-600/50 opacity-70 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
    </div>
  );
}
