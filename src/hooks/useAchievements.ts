import { useCallback } from 'react';
import { gamificationService } from '../services/gamificationService';
import { LeaderboardPeriod } from '../types';
import { useFetch } from './useFetch';

export function useAchievements() {
  const fetchProfile = useCallback((signal: AbortSignal) => gamificationService.getMyProfile(signal), []);
  const { data, loading, error, reload } = useFetch(fetchProfile);
  return { profile: data ?? null, loading, error, reload };
}

export function useLeaderboard(period: LeaderboardPeriod) {
  const fetchLeaderboard = useCallback(
    (signal: AbortSignal) => gamificationService.getLeaderboard(period, signal),
    [period]
  );
  const { data, loading, error, reload } = useFetch(fetchLeaderboard);
  return { entries: data ?? [], loading, error, reload };
}
