import { useEffect, useState } from 'react';
import { groupService } from '../services/groupService';

const REFRESH_MS = 30000;

export function useOnlineMembers(groupId: number, enabled = true) {
  const [online, setOnline] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const load = () => {
      if (document.hidden) return;
      groupService
        .getOnlineMembers(groupId, controller.signal)
        .then((ids) => setOnline(new Set(ids)))
        .catch(() => undefined);
    };
    load();
    const interval = window.setInterval(load, REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [groupId, enabled]);

  return online;
}
