import { axiosInstance } from './axiosInstance';
import { AnnouncementRequest, PageResponse, ReportResponse, ReportStatus, UserResponse } from '../types';

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

  async banUser(id: number, reason: string): Promise<UserResponse> {
    const { data } = await axiosInstance.patch<UserResponse>(`/admin/users/${id}/ban`, { reason });
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
};
