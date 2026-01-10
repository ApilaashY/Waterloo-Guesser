"use client";

import { useSocket } from "./SocketProvider";
import { useEffect, useState, useRef } from "react";

interface PlayerStats {
  inQueue: number;
  inMatch: number;
}

// Animated number component
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setDirection(value > prevValue.current ? 'up' : 'down');
      setIsAnimating(true);
      
      // Animate the number change
      const duration = 300;
      const startValue = prevValue.current;
      const endValue = value;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          setDirection(null);
        }
      };
      
      requestAnimationFrame(animate);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <span 
      className={`${className} inline-block transition-transform duration-200 ${
        isAnimating 
          ? direction === 'up' 
            ? 'text-green-400 scale-110' 
            : 'text-red-400 scale-110'
          : ''
      }`}
    >
      {displayValue}
    </span>
  );
}

export default function LivePlayerCount() {
  const { socket } = useSocket();
  const [stats, setStats] = useState<PlayerStats>({ inQueue: 0, inMatch: 0 });

  useEffect(() => {
    if (!socket) {
      console.log("[LivePlayerCount] Socket not available yet");
      return;
    }

    console.log("[LivePlayerCount] Socket connected, requesting stats");

    // Request initial stats
    socket.emit("requestPlayerStats");

    // Listen for player stats updates
    socket.on("playerStats", (data: PlayerStats) => {
      console.log("[LivePlayerCount] Received stats:", data);
      setStats(data);
    });

    return () => {
      socket.off("playerStats");
    };
  }, [socket]);

  return (
    <div className="ethereal-border bg-root/40 backdrop-blur-md rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative w-3 h-3 bg-accent-primary rounded-full"></div>
        </div>
        <div>
          <h3 className="text-primary font-data text-sm tracking-wider uppercase opacity-80">
            Live Players
          </h3>
          <div className="flex gap-6 mt-2">
            <div>
              <AnimatedNumber 
                value={stats.inMatch} 
                className="text-2xl font-bold text-primary font-data"
              />
              <p className="text-xs text-primary/60 font-data">In Match</p>
            </div>
            <div className="w-px bg-accent-primary/20"></div>
            <div>
              <AnimatedNumber 
                value={stats.inQueue} 
                className="text-2xl font-bold text-primary font-data"
              />
              <p className="text-xs text-primary/60 font-data">In Queue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
