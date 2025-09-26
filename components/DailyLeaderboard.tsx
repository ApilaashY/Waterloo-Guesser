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
      <div className={`rounded-xl bg-red-50 border border-red-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-800">Daily Leaderboard</h3>
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
    <div className={`rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-6 shadow-md ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Daily Leaderboard</h3>
            <p className="text-sm text-purple-600">
              Today's top scores from anonymous players
            </p>
          </div>
          {lastUpdated && (
            <div className="text-xs text-purple-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 bg-purple-200 rounded-md"></div>
              <div className="flex-1">
                <div className="h-4 bg-purple-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-purple-150 rounded w-16"></div>
              </div>
              <div className="h-4 bg-purple-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : data.length > 0 ? (
        <ol className="space-y-3">
          {data.map((entry, idx) => (
            <li key={`${entry.username}-${entry.timestamp}`} className="flex items-center gap-3">
              <div className="flex items-center gap-3 w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-tr from-purple-400 to-pink-400 text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-900">{entry.username}</div>
                  <div className="text-xs text-purple-600">
                    {entry.rounds} round{entry.rounds !== 1 ? 's' : ''} • {
                      new Date(entry.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-purple-900">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-600">pts</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-purple-500"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <p className="text-purple-600 font-medium">No scores yet today</p>
          <p className="text-purple-500 text-sm mt-1">
            Be the first to set a score!
          </p>
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <button
            onClick={refetch}
            className="w-full text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors duration-200 py-2 hover:bg-purple-50 rounded-lg"
          >
            🔄 Refresh Leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
