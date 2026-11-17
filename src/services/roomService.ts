import { axiosInstance } from './axiosInstance';
import { ChatRoom, RoomMessage, SendMessagePayload } from '../types';

export const roomService = {
  async getRooms(signal?: AbortSignal): Promise<ChatRoom[]> {
    const { data } = await axiosInstance.get<ChatRoom[]>('/rooms', { signal });
    return data;
  },

  async getRoom(roomId: number, signal?: AbortSignal): Promise<ChatRoom> {
    const { data } = await axiosInstance.get<ChatRoom>(`/rooms/${roomId}`, { signal });
    return data;
  },

  async createRoom(name: string, memberIds: number[]): Promise<ChatRoom> {
    const { data } = await axiosInstance.post<ChatRoom>('/rooms', { name, memberIds });
    return data;
  },

  async updateRoom(roomId: number, payload: { name?: string; addMemberIds?: number[] }): Promise<ChatRoom> {
    const { data } = await axiosInstance.patch<ChatRoom>(`/rooms/${roomId}`, payload);
    return data;
  },

  async leaveRoom(roomId: number): Promise<void> {
    await axiosInstance.post(`/rooms/${roomId}/leave`);
  },

  async getMessages(roomId: number, cursor: { after?: number; before?: number } = {}, signal?: AbortSignal): Promise<RoomMessage[]> {
    const { data } = await axiosInstance.get<RoomMessage[]>(`/rooms/${roomId}/messages`, { params: cursor, signal });
    return data;
  },

  async sendMessage(roomId: number, payload: SendMessagePayload): Promise<RoomMessage> {
    const { data } = await axiosInstance.post<RoomMessage>(`/rooms/${roomId}/messages`, payload);
    return data;
  },

  async editMessage(roomId: number, messageId: number, content: string): Promise<RoomMessage> {
    const { data } = await axiosInstance.put<RoomMessage>(`/rooms/${roomId}/messages/${messageId}`, { content });
    return data;
  },

  async deleteMessage(roomId: number, messageId: number): Promise<RoomMessage> {
    const { data } = await axiosInstance.delete<RoomMessage>(`/rooms/${roomId}/messages/${messageId}`);
    return data;
  },

  async markRead(roomId: number): Promise<void> {
    await axiosInstance.post(`/rooms/${roomId}/read`);
  },
};
