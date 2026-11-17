import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { AuthResponse, BanInfo } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const API_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '');
export const BAN_STORAGE_KEY = 'eduquest_ban';

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 600;
const RETRYABLE_STATUS = [502, 503, 504];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const readBanInfo = (error: unknown): BanInfo | null => {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) return null;
  const data = error.response.data as {
    code?: string;
    banReason?: string | null;
    bannedAt?: string | null;
    bannedUntil?: string | null;
  };
  if (data?.code !== 'USER_BANNED') return null;
  return { reason: data.banReason ?? null, bannedAt: data.bannedAt ?? null, bannedUntil: data.bannedUntil ?? null };
};

const redirectIfBanned = (error: unknown): boolean => {
  const info = readBanInfo(error);
  if (!info) return false;
  tokenStorage.clearSession();
  sessionStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(info));
  if (window.location.pathname !== '/banned') {
    window.location.href = '/banned';
  }
  return true;
};

const endSession = () => {
  tokenStorage.clearSession();
  window.location.href = '/login?expired=1';
};

const isRetryable = (error: AxiosError, config: RetriableConfig) => {
  if ((config.method ?? 'get').toLowerCase() !== 'get') return false;
  if ((config._retryCount ?? 0) >= MAX_RETRIES) return false;
  if (!error.response) return error.code !== 'ERR_CANCELED';
  return RETRYABLE_STATUS.includes(error.response.status);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isAuthEndpoint = (url?: string) => Boolean(url && /\/auth\/(login|register|refresh)/.test(url));

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((pending) => {
    if (error) pending.reject(error);
    else if (token) pending.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (axios.isCancel(error) || !error.config) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableConfig;

    if (redirectIfBanned(error)) {
      return Promise.reject(error);
    }

    if (isRetryable(error, config)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      await wait(RETRY_BASE_DELAY_MS * 2 ** (config._retryCount - 1));
      return axiosInstance(config);
    }

    if (error.response?.status !== 401 || config._retry || isAuthEndpoint(config.url)) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      endSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(config));
          },
          reject,
        });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthResponse>(`${BASE_URL}/auth/refresh`, { refreshToken });
      tokenStorage.setSession(data);
      processQueue(null, data.token);
      config.headers.Authorization = `Bearer ${data.token}`;
      return axiosInstance(config);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (!redirectIfBanned(refreshError)) endSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
