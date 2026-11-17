import { axiosInstance } from './axiosInstance';
import { Sticker } from '../types';

export const stickerService = {
  async getMine(signal?: AbortSignal): Promise<Sticker[]> {
    const { data } = await axiosInstance.get<Sticker[]>('/users/me/stickers', { signal });
    return data;
  },

  async add(imageUrl: string): Promise<Sticker> {
    const { data } = await axiosInstance.post<Sticker>('/users/me/stickers', { imageUrl });
    return data;
  },

  async remove(stickerId: number): Promise<void> {
    await axiosInstance.delete(`/users/me/stickers/${stickerId}`);
  },
};
