import { axiosInstance } from './axiosInstance';
import {
  DocumentRequest,
  DocumentResponse,
  PageResponse,
  ReviewRequest,
  ReviewResponse,
  ReviewUpdateRequest,
  UploadedFile,
} from '../types';

export interface DocumentQueryParams {
  page?: number;
  size?: number;
  search?: string;
  tag?: string;
  course?: string;
  university?: string;
  sort?: DocumentSort;
}

export type DocumentSort = 'recent' | 'oldest' | 'title';

export const documentService = {
  async getPublicDocuments(
    params: DocumentQueryParams,
    signal?: AbortSignal
  ): Promise<PageResponse<DocumentResponse>> {
    const cleanParams: Record<string, string | number> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
    };
    if (params.search?.trim()) cleanParams.search = params.search.trim();
    if (params.tag?.trim()) cleanParams.tag = params.tag.trim();
    if (params.course?.trim()) cleanParams.course = params.course.trim();
    if (params.university?.trim()) cleanParams.university = params.university.trim();
    cleanParams.sort = params.sort ?? 'recent';

    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>('/documents', {
      params: cleanParams,
      signal,
    });
    return data;
  },

  async uploadPublicDocument(payload: DocumentRequest): Promise<DocumentResponse> {
    const { data } = await axiosInstance.post<DocumentResponse>('/documents', payload);
    return data;
  },

  async getFeatured(signal?: AbortSignal): Promise<DocumentResponse[]> {
    const { data } = await axiosInstance.get<DocumentResponse[]>('/documents/featured', { signal });
    return data;
  },

  async updateDocument(id: number, payload: DocumentRequest): Promise<DocumentResponse> {
    const { data } = await axiosInstance.put<DocumentResponse>(`/documents/${id}`, payload);
    return data;
  },

  async deleteDocument(id: number): Promise<void> {
    await axiosInstance.delete(`/documents/${id}`);
  },

  async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<UploadedFile> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axiosInstance.post<UploadedFile>('/files', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return data;
  },

  async createReview(payload: ReviewRequest): Promise<ReviewResponse> {
    const { data } = await axiosInstance.post<ReviewResponse>('/reviews', payload);
    return data;
  },

  async updateReview(id: number, payload: ReviewUpdateRequest): Promise<ReviewResponse> {
    const { data } = await axiosInstance.put<ReviewResponse>(`/reviews/${id}`, payload);
    return data;
  },

  async deleteReview(id: number): Promise<void> {
    await axiosInstance.delete(`/reviews/${id}`);
  },

  async getReviewsByDocument(
    documentId: number,
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<ReviewResponse>> {
    const { data } = await axiosInstance.get<PageResponse<ReviewResponse>>(
      `/documents/${documentId}/reviews`,
      { params: { page, size }, signal }
    );
    return data;
  },

  async getSavedDocuments(page = 0, size = 10, signal?: AbortSignal): Promise<PageResponse<DocumentResponse>> {
    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>('/documents/saved', {
      params: { page, size },
      signal,
    });
    return data;
  },

  async getSavedIds(signal?: AbortSignal): Promise<number[]> {
    const { data } = await axiosInstance.get<number[]>('/documents/saved/ids', { signal });
    return data;
  },

  async setSaved(documentId: number, saved: boolean): Promise<void> {
    if (saved) {
      await axiosInstance.post(`/documents/${documentId}/saved`);
    } else {
      await axiosInstance.delete(`/documents/${documentId}/saved`);
    }
  },
};
