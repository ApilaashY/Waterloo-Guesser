"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ComingSoonPageProps {
  targetDate: Date;
  title: string;
  description: string;
}

export default function ComingSoonPage({ targetDate, title, description }: ComingSoonPageProps) {
  // State for Greg shake animation
  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  // Handle Greg click to trigger shake
  const handleGregClick = () => {
    setShakeCount((prev) => prev + 1);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#fff7d9' }}
    >
      {/* Main Under Construction Content */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Construction Site Illustration */}
        <div className="mb-8 relative">
            <Image
              src="/billboard construction.png"
              alt="Under Construction"
              width={800}
              height={500}
              className="w-full max-w-2xl object-contain"
            />
            
            {/* Countdown overlay on the billboard */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-yellow p-2 sm:p-4 rounded-lg text-center max-w-xs sm:max-w-md lg:max-w-2xl mx-auto">
                <div className="flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-8 text-xs sm:text-sm md:text-base lg:text-2xl" style={{ fontFamily: 'Felgine, sans-serif' }}>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-5xl font-bold text-yellow-400">{timeLeft.days}</div>
                    <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-base">DAYS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-5xl font-bold text-yellow-400">{timeLeft.hours}</div>
                    <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-base">HOURS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-5xl font-bold text-yellow-400">{timeLeft.minutes}</div>
                    <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-base">MINS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-5xl font-bold text-yellow-400">{timeLeft.seconds}</div>
                    <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-base">SECS</div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-800" style={{ fontFamily: 'Felgine, sans-serif' }}>
            {title}
          </h1>
          <p className="text-xl text-gray-600 max-w-md">
            {description}
          </p>
        </div>
      </div>

      {/* Construction Worker Greg */}
      <div
        className="absolute greg-construction-pos"
        style={{
          zIndex: 10,
          cursor: 'pointer',
          ...(isShaking ? { ['--greg-shake-scale' as any]: Math.pow(2, shakeCount) } : {})
        }}
        onClick={handleGregClick}
        title="Click Greg!"
      >
        <img
          src="/greg for conc.png"
          alt="Construction Worker Greg"
          width={120}
          height={120}
          className={`object-contain greg-img-responsive${isShaking ? ' greg-shake' : ''}`}
          style={isShaking ? { animationDuration: '0.6s' } : {}}
          draggable={false}
        />
      </div>
      <style jsx>{`
        .greg-construction-pos {
          top: calc(50% + 40px);
          right: calc(50% - 400px);
        }
        .greg-img-responsive {
          width: 120px !important;
          height: 120px !important;
          transition: transform 0.2s;
        }
        .greg-shake {
          animation: greg-shake-keyframes 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        .greg-shake {
          /* Use CSS variable for shake scale */
          --greg-shake-scale: 1;
        }
        @keyframes greg-shake-keyframes {
          10%, 90% { transform: translateX(calc(-10px * var(--greg-shake-scale, 1))); }
          20%, 80% { transform: translateX(calc(20px * var(--greg-shake-scale, 1))); }
          30%, 50%, 70% { transform: translateX(calc(-40px * var(--greg-shake-scale, 1))); }
          40%, 60% { transform: translateX(calc(40px * var(--greg-shake-scale, 1))); }
        }
        @media (max-width: 1200px) {
          .greg-construction-pos {
            top: calc(50% + 30px);
            right: calc(50% - 300px);
          }
        }
        @media (max-width: 900px) {
          .greg-construction-pos {
            top: calc(50% + 20px);
            right: calc(50% - 200px);
          }
        }
        @media (max-width: 600px) {
          .greg-construction-pos {
            top: calc(80%);
            right: calc(50% - 60px);
          }
          .greg-img-responsive {
            width: 70px !important;
            height: 70px !important;
          }
        }
        @media (max-width: 400px) {
          .greg-construction-pos {
            top: calc(90%);
            right: calc(50% - 30px);
          }
          .greg-img-responsive {
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </div>
  );
}
