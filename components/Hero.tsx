"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Head from "next/head";
import styles from "./dialogFont.module.css";
import bgStyles from "./dialogBg.module.css";
import Link from "next/link";

const targetDate = new Date("2025-09-04T00:00:00");

function getTimeRemaining(endDate: Date) {
  const total = endDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function LogoStar({ x, y, color, animationComplete }: { x: number; y: number; color: string; animationComplete: boolean }) {
  console.log("LogoStar x:", x, "y:", y);
  
  // Keep the same relative positioning but scale proportionally when animation completes
  const adjustedX = animationComplete ? (x / 4) * 0.5 : x / 4;
  const adjustedY = animationComplete ? 
    ((y / 3.5 - (x != 0 ? (Math.abs(y) / y) * 25 : 0)) * 0.5) : 
    (y / 3.5 - (x != 0 ? (Math.abs(y) / y) * 25 : 0));
  
  return (
    <img
      src={"/1-spoke.png"}
      className={`absolute z-10 transition-all duration-1000 ${
        animationComplete ? 'h-4 w-3' : 'h-7 w-5.2'
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

export default function Hero() {
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoHeight, setLogoHeight] = useState<number>(0);
  const [logoWidth, setLogoWidth] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [randomImage, setRandomImage] = useState<{x: number, y: number, visible: boolean, rotation: number}>({
    x: 0,
    y: 0,
    visible: false,
    rotation: 0
  });

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

    // Set animation complete after a delay (adjust timing as needed)
    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => {
      if (logoElement) {
        logoElement.removeEventListener("load", updateLogoDim);
      }
      window.removeEventListener("resize", updateLogoDim);
      clearTimeout(animationTimer);
    };
  }, []);

  // Separate useEffect for random image scheduling
  useEffect(() => {
    if (!animationComplete) return;

    // Random image popup logic
    const showRandomImage = () => {
      const x = Math.random() * (window.innerWidth - 200); // Subtract image width
      const y = Math.random() * (window.innerHeight - 200); // Subtract image height
      const rotation = Math.random() * 360; // Random rotation between 0-360 degrees
      setRandomImage({ x, y, visible: true, rotation });
      
      // Hide the image after 3 seconds
      setTimeout(() => {
        setRandomImage(prev => ({ ...prev, visible: false }));
      }, 3000);
    };

    // Show random image at random intervals (between 3-8 seconds for testing)
    const scheduleRandomImage = () => {
      const delay = Math.random() * 5000 + 3000; // 3-8 seconds
      const timeoutId = setTimeout(() => {
        showRandomImage();
        scheduleRandomImage(); // Schedule next appearance
      }, delay);
      return timeoutId;
    };

    // Start the first scheduling
    const timeoutId = scheduleRandomImage();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [animationComplete]);

  const handleRandomImageClick = () => {
    setRandomImage(prev => ({ ...prev, visible: false }));
    // Add any other click behavior here (e.g., play sound, show points, etc.)
  };

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>UW Guesser - University of Waterloo Campus Location Game</title>
        <meta name="title" content="UW Guesser - University of Waterloo Campus Location Game" />
        <meta name="description" content="Test your knowledge of the University of Waterloo campus! Play UW Guesser, an interactive location guessing game featuring campus photos. Challenge yourself in single-player mode or compete with friends in real-time multiplayer matches." />
        <meta name="keywords" content="University of Waterloo, UW, campus game, location game, geography game, Waterloo campus, location guessing game, uwaterloo game, multiplayer game, campus quiz, uwguessr, " />
        <meta name="author" content="Senthil Kirthieswar, Apilaash Yoharan" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uwguesser.com/" />
        <meta property="og:title" content="UW Guesser - University of Waterloo Campus Location Game" />
        <meta property="og:description" content="Test your knowledge of the UWaterloo campus! Play with your friends in real-time multiplayer matches, or go against teams and see who knows the campus best!" />
        <meta property="og:image" content="https://uwguesser.com/UWguesser-logo.png" />
        <meta property="og:image:alt" content="UW Guesser Logo" />
        <meta property="og:site_name" content="UW Guesser" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://uwguesser.com/" />
        <meta property="twitter:title" content="UW Guesser - University of Waterloo Campus Location Game" />
        <meta property="twitter:description" content="Test your knowledge of the University of Waterloo campus! Play UW Guesser, an interactive location guessing game featuring campus photos." />
        <meta property="twitter:image" content="https://uwguesser.com/UWguesser-logo.png" />
        <meta property="twitter:image:alt" content="UW Guesser Logo" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#090C9B" />
        <meta name="msapplication-TileColor" content="#090C9B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UW Guesser" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://uwguesser.com/" />
        
        {/* Structured Data for Gaming Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Game",
              "name": "UW Guesser",
              "description": "Interactive location guessing game featuring University of Waterloo campus photos. Test your knowledge of UW campus in single-player or multiplayer modes.",
              "url": "https://uwguesser.com/",
              "image": "https://uwguesser.com/UWguesser-logo.png",
              "author": {
                "@type": "Organization",
                "name": "UW Guesser Team",
                "member": [
                  {
                    "@type": "Person",
                    "name": "Senthil Kirthieswar"
                  },
                  {
                    "@type": "Person", 
                    "name": "Apilaash Yoharan"
                  }
                ]
              },
              "gameItem": {
                "@type": "Thing",
                "name": "Campus Location Quiz"
              },
              "numberOfPlayers": "1-8",
              "genre": ["Educational", "Geography", "Quiz"],
              "gamePlatform": "Web Browser",
              "applicationCategory": "Game",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CAD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150",
                "bestRating": "5"
              }
            })
          }}
        />
      </Head>
      <div className="bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 relative min-h-screen w-full overflow-hidden">
        {/* Random popup image */}
        {randomImage.visible && (
          <div
            className="absolute z-[200] cursor-pointer transition-all duration-300 hover:scale-110"
            style={{
              left: `${randomImage.x}px`,
              top: `${randomImage.y}px`,
              transform: `rotate(${randomImage.rotation}deg)`,
            }}
            onClick={handleRandomImageClick}
          >
            <img
              src="/egg symbol.png"
              alt="Random Popup"
              className="w-8 h-8 drop-shadow-lg"
            />
          </div>
        )}

        {/* Border frame around the screen edges */}
        <div className="absolute inset-4 border-2 border-[#090C9B] rounded-lg z-30 pointer-events-none"></div>

        {/* Book Button - Far Left position */}
        <div className="absolute left-1/2 top-1/2 transform z-[110]" style={{transform: 'translate(calc(-50% - 25rem), -50%)'}}>
          <Link href="/poster-board">
            <button
              className={`group relative transition-all duration-500 ${
                animationComplete 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="max-w-[6rem] max-h-[6rem] flex items-center justify-center">
                  <img
                    src="/book icon.png"
                    alt="Book Icon"
                    className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                </div>
                <div className="mt-1 sm:mt-2 text-[#090C9B] text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Lore
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* Laurel Button - Left position */}
        <div className="absolute left-1/2 top-1/2 transform z-[110]" style={{transform: 'translate(calc(-50% - 12rem), -50%)'}}>
          <Link href="/leaderboard">
            <button
              className={`group relative transition-all duration-500 ${
                animationComplete 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="max-w-[6rem] max-h-[6rem] flex items-center justify-center">
                  <img 
                    src="/laurel icon.png"
                    alt="Leaderboard Icon"
                    className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                </div>
                <div className="mt-1 sm:mt-2 text-[#090C9B] text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Leaderboard
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* Play Button - Center position */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[110]">
          <Link href="/modes">
            <button
              className={`group relative transition-all duration-500 ${
                animationComplete 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:scale-110 transition-transform duration-300 relative z-10 play-button"
                  >
                    <polygon
                      points="25,15 65,40 25,65"
                      fill="#090C9B"
                      className="group-hover:fill-[#d97f40] transition-colors duration-300"
                    />
                  </svg>
                </div>
                <div className="mt-1 sm:mt-2 text-[#090C9B] text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Play
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* Globe Button - Right position */}
        <div className="absolute left-1/2 top-1/2 transform z-[110]" style={{transform: 'translate(calc(-50% + 12rem), -50%)'}}>
          <Link href="/poster-board">
            <button
              className={`group relative transition-all duration-500 ${
                animationComplete 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="max-w-[6rem] max-h-[6rem] flex items-center justify-center">
                  <img
                    src="/globe.png"
                    alt="Globe Icon"
                    className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                </div>
                <div className="mt-1 sm:mt-2 text-[#090C9B] text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Poster Board
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* Camera Button - Far Right position */}
        <div className="absolute left-1/2 top-1/2 transform z-[110]" style={{transform: 'translate(calc(-50% + 25rem), -50%)'}}>
          <Link href="/leaderboard">
            <button
              className={`group relative transition-all duration-500 ${
                animationComplete 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className="max-w-[6rem] max-h-[6rem] flex items-center justify-center">
                  <img 
                    src="/camera icon clean.png"
                    alt="Camera Icon"
                    className="max-w-full max-h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                </div>
                <div className="mt-1 sm:mt-2 text-[#090C9B] text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                  Add Location
                </div>
              </div>
            </button>
          </Link>
        </div>

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

          {/* Main content - logo positioning */}
          <div
            className="fixed left-1/2 top-1/2 z-40"
            style={{
              transform: animationComplete
                ? `translate(-${window.innerWidth/2-40}px, -${window.innerHeight/2-40}px) scale(1)`
                : 'translate(-50%, -50%) scale(1.2)',
              transition:
                'transform 1.2s cubic-bezier(0.77,0,0.175,1), width 1.2s cubic-bezier(0.77,0,0.175,1), height 1.2s cubic-bezier(0.77,0,0.175,1)',
              width: animationComplete ? undefined : 'auto',
              height: animationComplete ? undefined : 'auto',
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
                        ? 'h-20 w-auto' 
                        : 'h-36 w-auto sm:h-44 lg:h-52'
                    }`}
                  />
                </div>
              </div>
            </div>
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
      </div>
      {/* UW GUESSER text at bottom right */}
      {/* <div
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[100] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-wide pointer-events-none select-none text-amber-800"
        style={{ fontFamily: 'Felgine, sans-serif'}}
      >
        UW GUESSER
      </div> */}
    </>
  );
}
