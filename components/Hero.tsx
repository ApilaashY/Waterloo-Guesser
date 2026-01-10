"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Head from "next/head";
import styles from "./dialogFont.module.css";
import bgStyles from "./dialogBg.module.css";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import PlayButton from "./hero/PlayButton";
import LeaderboardButton from "./hero/LeaderboardButton";
import LoreButton from "./hero/LoreButton";
import PosterBoardButton from "./hero/PosterBoardButton";
import AddLocationButton from "./hero/AddLocationButton";
import HeroBackground from "./hero/HeroBackground";
import CloudTransition from "./CloudTransition";

const targetDate = new Date("2025-09-04T00:00:00");

function getTimeRemaining(endDate: Date) {
  const total = endDate.getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

export default function Hero() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [showTransition, setShowTransition] = useState(false);
  const [randomImage, setRandomImage] = useState<{
    x: number;
    y: number;
    visible: boolean;
    rotation: number;
  }>({
    x: 0,
    y: 0,
    visible: false,
    rotation: 0,
  });

  useEffect(() => {
    // Set animation complete after a delay (adjust timing as needed)
    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => {
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
        setRandomImage((prev) => ({ ...prev, visible: false }));
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
    setRandomImage((prev) => ({ ...prev, visible: false }));
    // Navigate to the secret Greg page
    router.push("/greg");
  };

  const handlePlayClick = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = useCallback(() => {
    router.push("/modes");
  }, [router]);

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>UW Guesser - University of Waterloo Campus Location Game</title>
        <meta
          name="title"
          content="UW Guesser - University of Waterloo Campus Location Game"
        />
        <meta
          name="description"
          content="Test your knowledge of the University of Waterloo campus! Play UW Guesser, an interactive location guessing game featuring campus photos. Challenge yourself in single-player mode or compete with friends in real-time multiplayer matches."
        />
        <meta
          name="keywords"
          content="University of Waterloo, UW, campus game, location game, geography game, Waterloo campus, location guessing game, uwaterloo game, multiplayer game, campus quiz, uwguessr, "
        />
        <meta name="author" content="Senthil Kirthieswar, Apilaash Yoharan" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uwguesser.com/" />
        <meta
          property="og:title"
          content="UW Guesser - University of Waterloo Campus Location Game"
        />
        <meta
          property="og:description"
          content="Test your knowledge of the UWaterloo campus! Play with your friends in real-time multiplayer matches, or go against teams and see who knows the campus best!"
        />
        <meta
          property="og:image"
          content="https://uwguesser.com/UWguesser-logo.png"
        />
        <meta property="og:image:alt" content="UW Guesser Logo" />
        <meta property="og:site_name" content="UW Guesser" />
        <meta property="og:locale" content="en_CA" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://uwguesser.com/" />
        <meta
          property="twitter:title"
          content="UW Guesser - University of Waterloo Campus Location Game"
        />
        <meta
          property="twitter:description"
          content="Test your knowledge of the University of Waterloo campus! Play UW Guesser, an interactive location guessing game featuring campus photos."
        />
        <meta
          property="twitter:image"
          content="https://uwguesser.com/UWguesser-logo.png"
        />
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
              name: "UW Guesser",
              description:
                "Interactive location guessing game featuring University of Waterloo campus photos. Test your knowledge of UW campus in single-player or multiplayer modes.",
              url: "https://uwguesser.com/",
              image: "https://uwguesser.com/UWguesser-logo.png",
              author: {
                "@type": "Organization",
                name: "UW Guesser Team",
                member: [
                  {
                    "@type": "Person",
                    name: "Senthil Kirthieswar",
                  },
                  {
                    "@type": "Person",
                    name: "Apilaash Yoharan",
                  },
                ],
              },
              gameItem: {
                "@type": "Thing",
                name: "Campus Location Quiz",
              },
              numberOfPlayers: "1-8",
              genre: ["Educational", "Geography", "Quiz"],
              gamePlatform: "Web Browser",
              applicationCategory: "Game",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "CAD",
                availability: "https://schema.org/InStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
                bestRating: "5",
              },
            }),
          }}
        />
      </Head>

      {/* Cloud Transition Overlay */}
      {showTransition && <CloudTransition onComplete={handleTransitionComplete} />}

      <HeroBackground>
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

        {/* Mobile Layout - Vertical stack, visible only on mobile */}
        <div className="block">
          <div
            className={`absolute z-[110] transition-all duration-500 w-screen h-screen flex justify-evenly items-center-safe flex-row flex-wrap p-5 gap-5 ${animationComplete
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-75 pointer-events-none translate-y-16"
              }`}
          >
            <Link href="/leaderboard">
              <button
                className={`group relative transition-all duration-500 ml-10 mr-10`}
              >
                <div className="relative flex flex-col items-center justify-center">
                  {/* Floating Icon - No Box */}
                  <div className={`flex items-center justify-center w-20 h-20 transition-all duration-300 group-hover:scale-110`}>
                    <Image
                      src="/laurel icon.png"
                      alt="Leaderboard Icon"
                      width={48}
                      height={48}
                      className="max-w-full max-h-full brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300 relative z-10"
                    />
                  </div>
                  <div
                    className={`md:hidden mt-3 text-secondary text-sm font-medium transition-opacity duration-300 relative z-10 group-hover:text-primary group-hover:text-glow`}
                  >
                    Leaderboard
                  </div>
                </div>
              </button>
            </Link>
            {/* <Link href="/lore">
              <button
                className={`group relative transition-all duration-500 ml-10 mr-10`}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <div className={`flex items-center justify-center w-20 h-20 transition-all duration-300 group-hover:scale-110`}>
                    <Image
                      src="/book icon.png"
                      alt="Book Icon"
                      width={48}
                      height={48}
                      className="max-w-full max-h-full brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300 relative z-10"
                    />
                  </div>
                  <div
                    className={`md:hidden mt-3 text-secondary text-sm font-medium transition-opacity duration-300 relative z-10 group-hover:text-primary group-hover:text-glow`}
                  >
                    Lore
                  </div>
                </div>
              </button>
            </Link> */}

            <Link href="/hall-of-fame">
              <button
                className={`group relative transition-all duration-500 ml-10 mr-10`}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <div className={`flex items-center justify-center w-20 h-20 transition-all duration-300 group-hover:scale-110`}>
                    <Trophy
                      className="w-12 h-12 text-white/60 group-hover:text-white group-hover:drop-shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300 relative z-10"
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </div>
                  <div
                    className={`md:hidden mt-3 text-secondary text-sm font-medium transition-opacity duration-300 relative z-10 group-hover:text-primary group-hover:text-glow`}
                  >
                    Hall of Fame
                  </div>
                </div>
              </button>
            </Link>

            {/* PLAY BUTTON - Floating Icon */}
            <button
              onClick={handlePlayClick}
              className={`group relative transition-all duration-500 ml-10 mr-10 max-md:ml-20 max-md:mr-20 cursor-pointer`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div className={`flex items-center justify-center w-24 h-24 transition-all duration-300 group-hover:scale-110`}>
                  <svg
                    width={80}
                    height={80}
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`group-hover:scale-110 transition-transform duration-300 relative z-10 play-button drop-shadow-[0_0_15px_var(--accent-primary)]`}
                  >
                    <polygon
                      points="28,18 62,40 28,62"
                      className="fill-white/80 group-hover:fill-white transition-colors duration-300"
                    />
                  </svg>
                </div>
                <div
                  className={`md:hidden mt-3 text-primary text-sm font-semibold transition-opacity duration-300 relative z-10 text-glow`}
                >
                  Play
                </div>
              </div>
            </button>

            <Link href="/poster-board">
              <button
                className={`group relative transition-all duration-500 ml-8 mr-8`}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <div className={`flex items-center justify-center w-20 h-20 transition-all duration-300 group-hover:scale-110`}>
                    <Image
                      src="/Globe.png"
                      alt="Globe Icon"
                      width={48}
                      height={48}
                      className="max-w-full max-h-full brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300 relative z-10"
                    />
                  </div>
                  <div
                    className={`md:hidden mt-3 text-secondary text-sm font-medium transition-opacity duration-300 relative z-10 group-hover:text-primary group-hover:text-glow`}
                  >
                    Poster Board
                  </div>
                </div>
              </button>
            </Link>
            <Link href="/add-location">
              <button
                className={`group relative transition-all duration-500 ml-8 mr-8`}
              >
                <div className="relative flex flex-col items-center justify-center">
                  <div className={`flex items-center justify-center w-20 h-20 transition-all duration-300 group-hover:scale-110`}>
                    <Image
                      src="/camera icon clean.png"
                      alt="Camera Icon"
                      width={48}
                      height={48}
                      className="max-w-full max-h-full brightness-0 invert opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_var(--accent-primary)] transition-all duration-300 relative z-10"
                    />
                  </div>
                  <div
                    className={`md:hidden mt-3 text-secondary text-sm font-medium transition-opacity duration-300 relative z-10 group-hover:text-primary group-hover:text-glow`}
                  >
                    Add Location
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </HeroBackground>
    </>
  );
}
