import { axiosInstance } from './axiosInstance';
import { Conversation, DirectMessage, SendMessagePayload, UserSummary } from '../types';

export const messageService = {
  async getConversations(signal?: AbortSignal): Promise<Conversation[]> {
    const { data } = await axiosInstance.get<Conversation[]>('/conversations', { signal });
    return data;
  },

  async countUnread(signal?: AbortSignal): Promise<number> {
    const { data } = await axiosInstance.get<{ count: number }>('/conversations/unread-count', { signal });
    return data.count;
  },

  async searchUsers(search: string, signal?: AbortSignal): Promise<UserSummary[]> {
    const { data } = await axiosInstance.get<UserSummary[]>('/conversations/contacts', { params: { search }, signal });
    return data;
  },

  async getUser(userId: number, signal?: AbortSignal): Promise<UserSummary> {
    const { data } = await axiosInstance.get<UserSummary>(`/conversations/contacts/${userId}`, { signal });
    return data;
  },

  async getMessages(
    userId: number,
    cursor: { after?: number; before?: number } = {},
    signal?: AbortSignal
  ): Promise<DirectMessage[]> {
    const { data } = await axiosInstance.get<DirectMessage[]>(`/conversations/${userId}/messages`, {
      params: cursor,
      signal,
    });
    return data;
  },

  async sendMessage(userId: number, payload: SendMessagePayload): Promise<DirectMessage> {
    const { data } = await axiosInstance.post<DirectMessage>(`/conversations/${userId}/messages`, payload);
    return data;
  },

  async editMessage(userId: number, messageId: number, content: string): Promise<DirectMessage> {
    const { data } = await axiosInstance.put<DirectMessage>(`/conversations/${userId}/messages/${messageId}`, { content });
    return data;
  },

  async deleteMessage(userId: number, messageId: number): Promise<DirectMessage> {
    const { data } = await axiosInstance.delete<DirectMessage>(`/conversations/${userId}/messages/${messageId}`);
    return data;
  },

  async markRead(userId: number): Promise<void> {
    await axiosInstance.post(`/conversations/${userId}/read`);
  },
};
