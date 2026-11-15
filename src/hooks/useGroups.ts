import { useCallback } from 'react';
import { groupService } from '../services/groupService';
import { GroupRequest } from '../types';
import { usePaginatedFetch } from './usePaginatedFetch';

export function useGroups(page: number, size: number, search = '') {
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      groupService.getAllGroups(pageNumber, pageSize, signal, search),
    [search]
  );
  const list = usePaginatedFetch(fetchPage, page, size);

  const createGroup = useCallback((payload: GroupRequest) => groupService.createGroup(payload), []);
  const joinGroup = useCallback(
    (groupId: number, password?: string) => groupService.joinGroup(groupId, password),
    []
  );
  const findByCode = useCallback((code: string) => groupService.getGroupByCode(code), []);

  return { ...list, groups: list.items, createGroup, joinGroup, findByCode };
}
