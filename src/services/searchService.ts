import { axiosInstance } from './axiosInstance';
import { GlobalSearchResult } from '../types';

export const searchService = {
  async search(query: string, signal?: AbortSignal): Promise<GlobalSearchResult> {
    const { data } = await axiosInstance.get<GlobalSearchResult>('/search', { params: { q: query }, signal });
    return data;
  },
};
