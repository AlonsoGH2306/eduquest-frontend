import { useCallback, useEffect, useState } from 'react';
import { messageService } from '../services/messageService';
import { Conversation } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';

const REFRESH_INTERVAL_MS = 10_000;

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    messageService
      .getConversations(controller.signal)
      .then((data) => {
        setConversations(data);
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

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) reload();
    }, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [reload]);

  const clearUnread = useCallback((partnerId: number) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.partner.id === partnerId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
  }, []);

  return { conversations, loading, error, reload, clearUnread };
}
