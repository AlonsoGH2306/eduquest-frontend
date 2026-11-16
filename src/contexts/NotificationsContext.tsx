import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';
import { useRealtimeEvents } from '../hooks/useRealtime';
import { useAuth } from '../hooks/useAuth';

const REFRESH_INTERVAL_MS = 30_000;

interface NotificationsContextType {
  unreadNotifications: number;
  unreadMessages: number;
  refresh: () => void;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    notificationService
      .countUnread(controller.signal)
      .then(setUnreadNotifications)
      .catch(() => undefined);
    messageService
      .countUnread(controller.signal)
      .then(setUnreadMessages)
      .catch(() => undefined);
    return () => controller.abort();
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);
  const { user } = useAuth();
  const pending = useRef<number | null>(null);

  useRealtimeEvents((event) => {
    if (event.type !== 'direct.message' || event.action !== 'created' || event.recipientId !== user?.id) return;
    if (pending.current !== null) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      pending.current = null;
      refresh();
    }, 1500);
  }, Boolean(user));

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ unreadNotifications, unreadMessages, refresh, setUnreadNotifications }),
    [unreadNotifications, unreadMessages, refresh]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
