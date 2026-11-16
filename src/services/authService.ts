import { axiosInstance } from './axiosInstance';
import { AuthResponse, BanAppeal, LoginRequest, RegisterRequest, ResetPasswordRequest, UserResponse } from '../types';

export const authService = {
  async submitAppeal(username: string, password: string, message: string): Promise<BanAppeal> {
    const { data } = await axiosInstance.post<BanAppeal>('/auth/appeals', { username, password, message });
    return data;
  },

  async verifyEmail(code: string): Promise<UserResponse> {
    const { data } = await axiosInstance.post<UserResponse>('/users/me/verify-email', { code });
    return data;
  },

  async resendVerification(): Promise<void> {
    await axiosInstance.post('/users/me/verify-email/resend');
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  async forgotPassword(email: string): Promise<void> {
    await axiosInstance.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await axiosInstance.post('/auth/reset-password', payload);
  },
};
