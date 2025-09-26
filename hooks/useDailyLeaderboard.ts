"use client";

import { useState, useEffect } from 'react';

interface DailyLeaderboardEntry {
  username: string;
  score: number;
  rounds: number;
  timestamp: string;
}

interface DailyLeaderboardResponse {
  success: boolean;
  date: string;
  leaderboard: DailyLeaderboardEntry[];
  count: number;
}

export const useDailyLeaderboard = (date?: string, limit: number = 10) => {
  const [data, setData] = useState<DailyLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/dailyLeaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DailyLeaderboardResponse = await response.json();
      
      if (result.success) {
        setData(result.leaderboard);
        setLastUpdated(new Date());
      } else {
        throw new Error('Failed to fetch daily leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [date, limit]);

  const refetch = () => {
    fetchLeaderboard();
  };

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch
  };
};
