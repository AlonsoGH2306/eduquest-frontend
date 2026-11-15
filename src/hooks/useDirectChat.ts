import { useCallback, useEffect, useRef, useState } from 'react';
import { messageService } from '../services/messageService';
import { DirectMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';

const POLL_INTERVAL_MS = 4000;
const PAGE_SIZE = 50;

const mergeById = (current: DirectMessage[], incoming: DirectMessage[]) => {
  const known = new Set(current.map((message) => message.id));
  return [...current, ...incoming.filter((message) => !known.has(message.id))];
};

export function useDirectChat(userId: number | null) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    lastIdRef.current = messages.length > 0 ? messages[messages.length - 1].id : null;
  }, [messages]);

  useEffect(() => {
    if (userId === null) return;
    const controller = new AbortController();
    setLoading(true);
    setMessages([]);
    messageService
      .getMessages(userId, {}, controller.signal)
      .then((data) => {
        setMessages(data);
        setHasOlder(data.length === PAGE_SIZE);
        setError(null);
      })
      .catch((err) => {
        if (!isCanceledError(err)) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (userId === null) return;
    const poll = () => {
      if (document.hidden) return;
      const after = lastIdRef.current;
      messageService
        .getMessages(userId, after ? { after } : {})
        .then((data) => setMessages((current) => mergeById(current, data)))
        .catch(() => undefined);
    };
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (userId === null) return;
      const sent = await messageService.sendMessage(userId, content);
      setMessages((current) => mergeById(current, [sent]));
    },
    [userId]
  );

  const loadOlder = useCallback(async () => {
    if (userId === null || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const older = await messageService.getMessages(userId, { before: messages[0].id });
      setMessages((current) => [...older, ...current]);
      setHasOlder(older.length === PAGE_SIZE);
    } finally {
      setLoadingOlder(false);
    }
  }, [userId, messages]);

  return { messages, loading, error, hasOlder, loadingOlder, sendMessage, loadOlder };
}
