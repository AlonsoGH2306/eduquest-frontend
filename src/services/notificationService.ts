import { axiosInstance } from './axiosInstance';
import { AppNotification, PageResponse } from '../types';

export const notificationService = {
  async getNotifications(page = 0, size = 15, signal?: AbortSignal): Promise<PageResponse<AppNotification>> {
    const { data } = await axiosInstance.get<PageResponse<AppNotification>>('/notifications', {
      params: { page, size },
      signal,
    });
    return data;
  },

  async countUnread(signal?: AbortSignal): Promise<number> {
    const { data } = await axiosInstance.get<{ count: number }>('/notifications/unread-count', { signal });
    return data.count;
  },

  async markRead(id: number): Promise<void> {
    await axiosInstance.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await axiosInstance.patch('/notifications/read-all');
  },
};
