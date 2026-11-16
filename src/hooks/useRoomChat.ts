import { useCallback, useEffect, useRef, useState } from 'react';
import { roomService } from '../services/roomService';
import { ChatAttachment, RoomMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { mergeById, replaceMessage } from '../utils/chatMessages';
import { useAuth } from './useAuth';
import { useRealtimeConnected, useRealtimeEvents } from './useRealtime';

const POLL_INTERVAL_MS = 4000;
const CONNECTED_POLL_INTERVAL_MS = 30000;
const PAGE_SIZE = 50;

export function useRoomChat(roomId: number) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastIdRef = useRef<number | null>(null);
  const connected = useRealtimeConnected();

  useEffect(() => {
    lastIdRef.current = messages.length > 0 ? messages[messages.length - 1].id : null;
  }, [messages]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setMessages([]);
    roomService
      .getMessages(roomId, {}, controller.signal)
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
  }, [roomId]);

  useEffect(() => {
    const poll = () => {
      if (document.hidden) return;
      const after = lastIdRef.current;
      roomService
        .getMessages(roomId, after ? { after } : {})
        .then((data) => setMessages((current) => mergeById(current, data)))
        .catch(() => undefined);
    };
    const interval = window.setInterval(poll, connected ? CONNECTED_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [roomId, connected]);

  useRealtimeEvents((event) => {
    if (event.type !== 'room.message' || event.roomId !== roomId) return;
    const message = { ...(event.message as RoomMessage) };
    message.mine = message.authorId === user?.id;
    setMessages((current) => (event.action === 'created' ? mergeById(current, [message]) : replaceMessage(current, message)));
  });

  const sendMessage = useCallback(
    async (content: string, attachment?: ChatAttachment, replyToId?: number) => {
      const sent = await roomService.sendMessage(roomId, { content, ...attachment, replyToId });
      setMessages((current) => mergeById(current, [sent]));
    },
    [roomId]
  );

  const editMessage = useCallback(
    async (messageId: number, content: string) => {
      const updated = await roomService.editMessage(roomId, messageId, content);
      setMessages((current) => replaceMessage(current, updated));
    },
    [roomId]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      const deleted = await roomService.deleteMessage(roomId, messageId);
      setMessages((current) => replaceMessage(current, deleted));
    },
    [roomId]
  );

  const loadOlder = useCallback(async () => {
    if (messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const older = await roomService.getMessages(roomId, { before: messages[0].id });
      setMessages((current) => [...older, ...current]);
      setHasOlder(older.length === PAGE_SIZE);
    } finally {
      setLoadingOlder(false);
    }
  }, [roomId, messages]);

  return { messages, loading, error, hasOlder, loadingOlder, sendMessage, editMessage, deleteMessage, loadOlder };
}
