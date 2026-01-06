"use client";

import { useDailyLeaderboard } from '@/hooks/useDailyLeaderboard';

interface DailyLeaderboardProps {
  className?: string;
  showTitle?: boolean;
  maxEntries?: number;
}

export default function DailyLeaderboard({ 
  className = "", 
  showTitle = true, 
  maxEntries = 10 
}: DailyLeaderboardProps) {
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading, error, lastUpdated, refetch } = useDailyLeaderboard(today, maxEntries);

  if (error) {
    return (
      <div className={`rounded-xl bg-white/50 backdrop-blur-md border border-red-300/50 p-6 shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#090C9B]">Daily Leaderboard</h3>
          <button
            onClick={refetch}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
        <p className="text-red-600 text-sm">Failed to load daily leaderboard: {error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-white/50 backdrop-blur-md border border-[#090C9B]/10 p-6 shadow-lg ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#090C9B]">Daily Leaderboard</h3>
            <p className="text-sm text-[#090C9B]/70">
              Anonymous Andies of the day
            </p>
          </div>
          {lastUpdated && (
            <div className="text-xs text-[#090C9B]/60">
              Updated: {lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 bg-blue-200 rounded-md"></div>
              <div className="flex-1">
                <div className="h-4 bg-blue-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-blue-150 rounded w-16"></div>
              </div>
              <div className="h-4 bg-blue-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : data.length > 0 ? (
        <ol className="space-y-3">
          {data.map((entry, idx) => (
            <li key={`${entry.username}-${entry.timestamp}`} className="flex items-center gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-md font-bold text-sm bg-gradient-to-br from-blue-300 to-blue-500 text-white">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#090C9B]">{entry.username}</div>
                  <div className="text-xs text-[#090C9B]/60">
                    {entry.rounds} round{entry.rounds !== 1 ? 's' : ''} • {
                      new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-[#090C9B]">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#090C9B]/60">pts</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#090C9B]/60"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <p className="text-[#090C9B] font-medium">No scores yet today</p>
          <p className="text-[#090C9B]/60 text-sm mt-1">
            Be the first to set a score!
          </p>
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#090C9B]/10">
          <button
            onClick={refetch}
            className="w-full text-[#090C9B] hover:text-[#090C9B]/80 text-sm font-medium transition-colors duration-200 py-2 hover:bg-white/50 rounded-lg"
          >
            Refresh Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
