import { useCallback, useEffect, useRef, useState } from 'react';
import { messageService } from '../services/messageService';
import { ChatAttachment, DirectMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { mergeById, replaceMessage } from '../utils/chatMessages';
import { useAuth } from './useAuth';
import { useRealtimeConnected, useRealtimeEvents, useTyping } from './useRealtime';

const POLL_INTERVAL_MS = 4000;
const CONNECTED_POLL_INTERVAL_MS = 30000;
const PAGE_SIZE = 50;

export function useDirectChat(userId: number | null) {
  const { user } = useAuth();
  const myId = user?.id;
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastIdRef = useRef<number | null>(null);
  const connected = useRealtimeConnected();
  const { typingNames, notifyTyping, clearSelf } = useTyping(userId === null ? null : { userId });

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
    const interval = window.setInterval(poll, connected ? CONNECTED_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [userId, connected]);

  useRealtimeEvents((event) => {
    if (event.type !== 'direct.message' || userId === null) return;
    const partnerId = event.senderId === myId ? event.recipientId : event.senderId;
    if (partnerId !== userId) return;
    const message = { ...(event.message as DirectMessage) };
    message.mine = message.senderId === myId;
    if (event.action === 'created') {
      clearSelf(message.senderId);
      setMessages((current) => mergeById(current, [message]));
    } else {
      setMessages((current) => replaceMessage(current, message));
    }
  }, userId !== null);

  const sendMessage = useCallback(
    async (content: string, attachment?: ChatAttachment, replyToId?: number) => {
      if (userId === null) return;
      const sent = await messageService.sendMessage(userId, { content, ...attachment, replyToId });
      setMessages((current) => mergeById(current, [sent]));
    },
    [userId]
  );

  const editMessage = useCallback(
    async (messageId: number, content: string) => {
      if (userId === null) return;
      const updated = await messageService.editMessage(userId, messageId, content);
      setMessages((current) => replaceMessage(current, updated));
    },
    [userId]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (userId === null) return;
      const deleted = await messageService.deleteMessage(userId, messageId);
      setMessages((current) => replaceMessage(current, deleted));
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

  return {
    messages,
    loading,
    error,
    hasOlder,
    loadingOlder,
    typingNames,
    notifyTyping,
    sendMessage,
    editMessage,
    deleteMessage,
    loadOlder,
  };
}
