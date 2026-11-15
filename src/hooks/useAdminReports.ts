import { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { ReportResponse, ReportStatus } from '../types';
import { usePaginatedFetch } from './usePaginatedFetch';

export function useAdminReports(status: ReportStatus, page: number, size: number) {
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      adminService.getReports(status, pageNumber, pageSize, signal),
    [status]
  );
  const list = usePaginatedFetch(fetchPage, page, size);
  const { setItems } = list;

  const closeReport = useCallback(
    async (report: ReportResponse, newStatus: Exclude<ReportStatus, 'OPEN'>) => {
      const updated = await adminService.closeReport(report.id, newStatus);
      setItems((items) => items.filter((item) => item.id !== updated.id));
      return updated;
    },
    [setItems]
  );

  const deleteDocument = useCallback((documentId: number) => adminService.deleteDocument(documentId), []);
  const banUser = useCallback((userId: number, reason: string) => adminService.banUser(userId, reason), []);

  return { ...list, reports: list.items, closeReport, deleteDocument, banUser };
}

export function useOpenReportsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    adminService
      .countOpenReports(controller.signal)
      .then(setCount)
      .catch(() => setCount(0));
    return () => controller.abort();
  }, []);

  return count;
}
