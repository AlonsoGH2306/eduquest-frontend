import { axiosInstance } from './axiosInstance';
import { PinnedChat, PinnedChatKind, StatusRequest, UserStatus } from '../types';

export const personalService = {
  async updateStatus(payload: StatusRequest): Promise<UserStatus> {
    const { data } = await axiosInstance.put<UserStatus>('/users/me/status', payload);
    return data;
  },

  async getStatuses(ids: number[], signal?: AbortSignal): Promise<UserStatus[]> {
    if (ids.length === 0) return [];
    const { data } = await axiosInstance.get<UserStatus[]>('/users/statuses', { params: { ids: ids.join(',') }, signal });
    return data;
  },

  async getPinnedChats(signal?: AbortSignal): Promise<PinnedChat[]> {
    const { data } = await axiosInstance.get<PinnedChat[]>('/users/me/pinned-chats', { signal });
    return data;
  },

  async setPinned(kind: PinnedChatKind, targetId: number, pinned: boolean): Promise<PinnedChat[]> {
    const { data } = await axiosInstance.put<PinnedChat[]>('/users/me/pinned-chats', { kind, targetId, pinned });
    return data;
  },
};
