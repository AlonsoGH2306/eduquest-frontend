import { axiosInstance } from './axiosInstance';
import {
  AdminStats,
  AnnouncementRequest,
  AppealStatus,
  BanAppeal,
  DocumentResponse,
  PageResponse,
  ReportResponse,
  ReportStatus,
  UserResponse,
} from '../types';

export const adminService = {
  async getUsers(
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<UserResponse>> {
    const { data } = await axiosInstance.get<PageResponse<UserResponse>>('/admin/users', {
      params: { page, size },
      signal,
    });
    return data;
  },

  async banUser(id: number, reason: string, days: number | null = null): Promise<UserResponse> {
    const { data } = await axiosInstance.patch<UserResponse>(`/admin/users/${id}/ban`, { reason, days });
    return data;
  },

  async unbanUser(id: number): Promise<UserResponse> {
    const { data } = await axiosInstance.patch<UserResponse>(`/admin/users/${id}/unban`);
    return data;
  },

  async updateUserRole(id: number, role: string): Promise<UserResponse> {
    const { data } = await axiosInstance.patch<UserResponse>(`/admin/users/${id}/role`, null, {
      params: { role },
    });
    return data;
  },

  async getAppeals(status: AppealStatus | '', page = 0, size = 10, signal?: AbortSignal): Promise<PageResponse<BanAppeal>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const { data } = await axiosInstance.get<PageResponse<BanAppeal>>('/admin/appeals', { params, signal });
    return data;
  },

  async countPendingAppeals(signal?: AbortSignal): Promise<number> {
    const { data } = await axiosInstance.get<{ count: number }>('/admin/appeals/pending-count', { signal });
    return data.count;
  },

  async decideAppeal(id: number, accepted: boolean, response: string): Promise<BanAppeal> {
    const { data } = await axiosInstance.patch<BanAppeal>(`/admin/appeals/${id}`, { accepted, response });
    return data;
  },

  async getReports(
    status: ReportStatus | '',
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<ReportResponse>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params.status = status;
    const { data } = await axiosInstance.get<PageResponse<ReportResponse>>('/admin/reports', { params, signal });
    return data;
  },

  async countOpenReports(signal?: AbortSignal): Promise<number> {
    const { data } = await axiosInstance.get<{ count: number }>('/admin/reports/open-count', { signal });
    return data.count;
  },

  async closeReport(id: number, status: Exclude<ReportStatus, 'OPEN'>): Promise<ReportResponse> {
    const { data } = await axiosInstance.patch<ReportResponse>(`/admin/reports/${id}`, { status });
    return data;
  },

  async deleteDocument(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/documents/${id}`);
  },

  async sendAnnouncement(request: AnnouncementRequest): Promise<number> {
    const { data } = await axiosInstance.post<{ recipients: number }>('/admin/notifications', request);
    return data.recipients;
  },

  async warnUser(id: number, message: string): Promise<void> {
    await axiosInstance.post(`/admin/users/${id}/warning`, { message });
  },

  async getStats(signal?: AbortSignal): Promise<AdminStats> {
    const { data } = await axiosInstance.get<AdminStats>('/admin/stats', { signal });
    return data;
  },

  async setFeatured(documentId: number, featured: boolean): Promise<DocumentResponse> {
    const { data } = await axiosInstance.patch<DocumentResponse>(`/admin/documents/${documentId}/featured`, null, {
      params: { featured },
    });
    return data;
  },
};
