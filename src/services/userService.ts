import { axiosInstance } from './axiosInstance';
import { AuthResponse, UserResponse } from '../types';

export const userService = {
  async getMe(signal?: AbortSignal): Promise<UserResponse> {
    const { data } = await axiosInstance.get<UserResponse>('/users/me', { signal });
    return data;
  },

  async updateProfile(username: string, advisor?: boolean): Promise<AuthResponse> {
    const { data } = await axiosInstance.patch<AuthResponse>('/users/me', { username, advisor });
    return data;
  },

  async uploadAvatar(file: File): Promise<UserResponse> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axiosInstance.put<UserResponse>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.patch('/users/me/password', { currentPassword, newPassword });
  },

  async deleteAvatar(): Promise<void> {
    await axiosInstance.delete('/users/me/avatar');
  },
};
