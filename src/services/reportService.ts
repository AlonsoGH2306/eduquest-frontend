import { axiosInstance } from './axiosInstance';
import { ReportRequest, ReportResponse } from '../types';

export const reportService = {
  async createReport(payload: ReportRequest): Promise<ReportResponse> {
    const { data } = await axiosInstance.post<ReportResponse>('/reports', payload);
    return data;
  },
};
