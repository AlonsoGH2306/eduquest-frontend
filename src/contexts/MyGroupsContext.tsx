import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { groupService } from '../services/groupService';
import { GroupResponse } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { useRealtimeEvents } from '../hooks/useRealtime';
import { useAuth } from '../hooks/useAuth';

const REFRESH_INTERVAL_MS = 60_000;

interface MyGroupsContextType {
  groups: GroupResponse[];
  loading: boolean;
  error: string | null;
  totalUnread: number;
  refresh: () => void;
  markSeen: (groupId: number) => Promise<void>;
  markChatSeen: (groupId: number) => Promise<void>;
}

export const MyGroupsContext = createContext<MyGroupsContextType | undefined>(undefined);

export const MyGroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    groupService
      .getMyGroups(controller.signal)
      .then((data) => {
        setGroups(data);
        setError(null);
      })
      .catch((err) => {
        if (!isCanceledError(err)) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);
  const { user } = useAuth();
  const pending = useRef<number | null>(null);

  useRealtimeEvents((event) => {
    if (event.type !== 'group.message' || event.action !== 'created') return;
    if ((event.message as { authorId?: number }).authorId === user?.id) return;
    if (pending.current !== null) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      pending.current = null;
      refresh();
    }, 1500);
  }, Boolean(user));

  useEffect(() => {
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const markSeen = useCallback(async (groupId: number) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId ? { ...group, unreadCount: 0, unreadDocuments: 0, unreadSessions: 0 } : group
      )
    );
    await groupService.markGroupSeen(groupId);
  }, []);

  const markChatSeen = useCallback(async (groupId: number) => {
    setGroups((current) => current.map((group) => (group.id === groupId ? { ...group, unreadMessages: 0 } : group)));
    await groupService.markChatSeen(groupId);
  }, []);

  const value = useMemo(
    () => ({
      groups,
      loading,
      error,
      totalUnread: groups.reduce((sum, group) => sum + (group.unreadCount ?? 0) + (group.unreadMessages ?? 0), 0),
      refresh,
      markSeen,
      markChatSeen,
    }),
    [groups, loading, error, refresh, markSeen, markChatSeen]
  );

  return <MyGroupsContext.Provider value={value}>{children}</MyGroupsContext.Provider>;
};
