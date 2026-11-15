import { useCallback, useState } from 'react';
import { groupService } from '../services/groupService';
import { GroupResponse } from '../types';
import { useFetch } from './useFetch';

export function useInvite(code: string, token: string | null) {
  const fetchGroup = useCallback((signal: AbortSignal) => groupService.getGroupByCode(code, signal), [code]);
  const { data: group, loading, error, errorStatus, reload } = useFetch(fetchGroup);
  const [joining, setJoining] = useState(false);

  const joinWithInvite = useCallback(async (): Promise<GroupResponse | null> => {
    if (!group) return null;
    setJoining(true);
    try {
      return await groupService.joinGroup(group.id, undefined, token ?? undefined);
    } finally {
      setJoining(false);
    }
  }, [group, token]);

  const joinWithPassword = useCallback(
    (groupId: number, password: string) => groupService.joinGroup(groupId, password),
    []
  );

  return { group: group ?? null, loading, error, errorStatus, reload, joining, joinWithInvite, joinWithPassword };
}
