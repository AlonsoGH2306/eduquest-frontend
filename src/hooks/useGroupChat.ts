import { useCallback, useEffect, useRef, useState } from 'react';
import { groupService } from '../services/groupService';
import { GroupMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';

const POLL_INTERVAL_MS = 4000;
const PAGE_SIZE = 50;

const mergeById = (current: GroupMessage[], incoming: GroupMessage[]) => {
  const known = new Set(current.map((message) => message.id));
  return [...current, ...incoming.filter((message) => !known.has(message.id))];
};

export function useGroupChat(groupId: number, enabled: boolean) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    lastIdRef.current = messages.length > 0 ? messages[messages.length - 1].id : null;
  }, [messages]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    groupService
      .getMessages(groupId, {}, controller.signal)
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
  }, [groupId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const poll = () => {
      if (document.hidden) return;
      const after = lastIdRef.current;
      groupService
        .getMessages(groupId, after ? { after } : {})
        .then((data) => setMessages((current) => mergeById(current, data)))
        .catch(() => undefined);
    };
    const interval = window.setInterval(poll, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [groupId, enabled]);

  const sendMessage = useCallback(
    async (content: string) => {
      const sent = await groupService.sendMessage(groupId, content);
      setMessages((current) => mergeById(current, [sent]));
    },
    [groupId]
  );

  const loadOlder = useCallback(async () => {
    if (messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const older = await groupService.getMessages(groupId, { before: messages[0].id });
      setMessages((current) => [...older, ...current]);
      setHasOlder(older.length === PAGE_SIZE);
    } finally {
      setLoadingOlder(false);
    }
  }, [groupId, messages]);

  return { messages, loading, error, hasOlder, loadingOlder, sendMessage, loadOlder };
}
