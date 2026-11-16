import { axiosInstance } from './axiosInstance';
import { AuthResponse, DocumentResponse, PageResponse, PublicProfile, UserResponse, UserSummary } from '../types';

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

  async getProfile(userId: number, signal?: AbortSignal): Promise<PublicProfile> {
    const { data } = await axiosInstance.get<PublicProfile>(`/users/${userId}/profile`, { signal });
    return data;
  },

  async getDocuments(userId: number, page: number, size: number, signal?: AbortSignal): Promise<PageResponse<DocumentResponse>> {
    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>(`/users/${userId}/documents`, {
      params: { page, size },
      signal,
    });
    return data;
  },

  async follow(userId: number): Promise<void> {
    await axiosInstance.post(`/users/${userId}/follow`);
  },

  async unfollow(userId: number): Promise<void> {
    await axiosInstance.delete(`/users/${userId}/follow`);
  },

  async getFollowing(signal?: AbortSignal): Promise<UserSummary[]> {
    const { data } = await axiosInstance.get<UserSummary[]>('/users/me/following', { signal });
    return data;
  },
};
