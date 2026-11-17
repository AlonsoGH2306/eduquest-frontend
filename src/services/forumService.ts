import { axiosInstance } from './axiosInstance';
import { ForumAnswer, ForumFilter, ForumQuestion, ForumThread, PageResponse } from '../types';

export interface ForumQuery {
  search?: string;
  course?: string;
  filter?: ForumFilter;
  page?: number;
  size?: number;
}

export const forumService = {
  async getQuestions(query: ForumQuery, signal?: AbortSignal): Promise<PageResponse<ForumQuestion>> {
    const { data } = await axiosInstance.get<PageResponse<ForumQuestion>>('/forum/questions', { params: query, signal });
    return data;
  },

  async ask(title: string, body: string, course: string): Promise<ForumQuestion> {
    const { data } = await axiosInstance.post<ForumQuestion>('/forum/questions', { title, body, course });
    return data;
  },

  async getThread(questionId: number, signal?: AbortSignal): Promise<ForumThread> {
    const { data } = await axiosInstance.get<ForumThread>(`/forum/questions/${questionId}`, { signal });
    return data;
  },

  async deleteQuestion(questionId: number): Promise<void> {
    await axiosInstance.delete(`/forum/questions/${questionId}`);
  },

  async answer(questionId: number, body: string): Promise<ForumAnswer> {
    const { data } = await axiosInstance.post<ForumAnswer>(`/forum/questions/${questionId}/answers`, { body });
    return data;
  },

  async deleteAnswer(answerId: number): Promise<void> {
    await axiosInstance.delete(`/forum/answers/${answerId}`);
  },

  async vote(answerId: number, value: number): Promise<ForumAnswer> {
    const { data } = await axiosInstance.post<ForumAnswer>(`/forum/answers/${answerId}/vote`, { value });
    return data;
  },

  async accept(questionId: number, answerId: number): Promise<ForumThread> {
    const { data } = await axiosInstance.post<ForumThread>(`/forum/questions/${questionId}/answers/${answerId}/accept`);
    return data;
  },
};
