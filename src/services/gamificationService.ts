import { axiosInstance } from './axiosInstance';
import { GamificationProfile, LeaderboardEntry, LeaderboardPeriod } from '../types';

export const gamificationService = {
  async getMyProfile(signal?: AbortSignal): Promise<GamificationProfile> {
    const { data } = await axiosInstance.get<GamificationProfile>('/gamification/me', { signal });
    return data;
  },

  async getLeaderboard(period: LeaderboardPeriod, signal?: AbortSignal): Promise<LeaderboardEntry[]> {
    const { data } = await axiosInstance.get<LeaderboardEntry[]>('/gamification/leaderboard', {
      params: { period },
      signal,
    });
    return data;
  },
};
