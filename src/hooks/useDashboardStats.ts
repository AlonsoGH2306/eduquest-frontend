import { useCallback } from 'react';
import { documentService } from '../services/documentService';
import { groupService } from '../services/groupService';
import { studyPlanService } from '../services/studyPlanService';
import { DocumentResponse } from '../types';
import { useFetch } from './useFetch';

export interface DashboardStats {
  documents: number;
  groups: number;
  plans: number;
  recentDocuments: DocumentResponse[];
}

export function useDashboardStats() {
  const fetchStats = useCallback(async (signal: AbortSignal): Promise<DashboardStats> => {
    const [documents, groups, plans] = await Promise.allSettled([
      documentService.getPublicDocuments({ page: 0, size: 4, sort: 'recent' }, signal),
      groupService.getAllGroups(0, 1, signal),
      studyPlanService.getMyPlans(signal),
    ]);
    if (documents.status === 'rejected') throw documents.reason;
    return {
      documents: documents.value.totalElements,
      recentDocuments: documents.value.content,
      groups: groups.status === 'fulfilled' ? groups.value.totalElements : 0,
      plans: plans.status === 'fulfilled' ? plans.value.length : 0,
    };
  }, []);

  const { data, loading, error, reload } = useFetch(fetchStats);
  return { stats: data ?? null, loading, error, reload };
}
