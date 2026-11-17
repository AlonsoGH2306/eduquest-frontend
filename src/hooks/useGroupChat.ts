import { useCallback, useEffect, useRef, useState } from 'react';
import { groupService } from '../services/groupService';
import { ChatAttachment, GroupMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { mergeById, replaceMessage } from '../utils/chatMessages';
import { useAuth } from './useAuth';
import { useRealtimeConnected, useRealtimeEvents, useTyping } from './useRealtime';

const POLL_INTERVAL_MS = 4000;
const CONNECTED_POLL_INTERVAL_MS = 30000;
const PAGE_SIZE = 50;

const bumpThread = (current: GroupMessage[], rootId: number) =>
  current.map((message) =>
    message.id === rootId ? { ...message, threadReplyCount: (message.threadReplyCount ?? 0) + 1 } : message
  );

export function useGroupChat(groupId: number, channelId: number | null, enabled: boolean) {
  const { user } = useAuth();
  const myId = user?.id;
  const active = enabled && channelId !== null;
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastIdRef = useRef<number | null>(null);
  const connected = useRealtimeConnected();
  const { typingNames, notifyTyping, clearSelf } = useTyping(active ? { groupId } : null);

  useEffect(() => {
    lastIdRef.current = messages.length > 0 ? messages[messages.length - 1].id : null;
  }, [messages]);

  useEffect(() => {
    if (!active || channelId === null) return;
    const controller = new AbortController();
    setLoading(true);
    setMessages([]);
    groupService
      .getMessages(groupId, { channelId }, controller.signal)
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
  }, [groupId, channelId, active]);

  useEffect(() => {
    if (!active || channelId === null) return;
    const poll = () => {
      if (document.hidden) return;
      const after = lastIdRef.current;
      groupService
        .getMessages(groupId, after ? { channelId, after } : { channelId })
        .then((data) => setMessages((current) => mergeById(current, data)))
        .catch(() => undefined);
    };
    const interval = window.setInterval(poll, connected ? CONNECTED_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [groupId, channelId, active, connected]);

  useRealtimeEvents((event) => {
    if (event.type !== 'group.message' || event.groupId !== groupId || event.channelId !== channelId) return;
    const message = { ...(event.message as GroupMessage) };
    message.mine = message.authorId === myId;
    if (message.threadRootId) {
      if (event.action === 'created') setMessages((current) => bumpThread(current, message.threadRootId!));
      return;
    }
    if (event.action === 'created') {
      clearSelf(message.authorId);
      setMessages((current) => mergeById(current, [message]));
    } else {
      setMessages((current) => {
        const previous = current.find((item) => item.id === message.id);
        return replaceMessage(current, { ...message, saved: previous?.saved ?? false });
      });
    }
  }, active);

  const sendMessage = useCallback(
    async (content: string, attachment?: ChatAttachment, replyToId?: number) => {
      if (channelId === null) return;
      const sent = await groupService.sendMessage(groupId, { content, ...attachment, replyToId, channelId });
      setMessages((current) => mergeById(current, [sent]));
    },
    [groupId, channelId]
  );

  const applyUpdate = useCallback((updated: GroupMessage) => {
    setMessages((current) => replaceMessage(current, updated));
  }, []);

  const editMessage = useCallback(
    async (messageId: number, content: string) => applyUpdate(await groupService.editMessage(groupId, messageId, content)),
    [groupId, applyUpdate]
  );

  const deleteMessage = useCallback(
    async (messageId: number) => applyUpdate(await groupService.deleteMessage(groupId, messageId)),
    [groupId, applyUpdate]
  );

  const toggleReaction = useCallback(
    async (messageId: number, emoji: string) => applyUpdate(await groupService.toggleReaction(groupId, messageId, emoji)),
    [groupId, applyUpdate]
  );

  const togglePin = useCallback(
    async (message: GroupMessage) => applyUpdate(await groupService.setPinned(groupId, message.id, !message.pinned)),
    [groupId, applyUpdate]
  );

  const votePoll = useCallback(
    async (pollId: number, optionId: number | null) => applyUpdate(await groupService.votePoll(groupId, pollId, optionId)),
    [groupId, applyUpdate]
  );

  const toggleSaved = useCallback(
    async (message: GroupMessage) => applyUpdate(await groupService.setSaved(groupId, message.id, !message.saved)),
    [groupId, applyUpdate]
  );

  const loadAround = useCallback(
    async (messageId: number) => {
      if (channelId === null) return false;
      const data = await groupService.getMessages(groupId, { channelId, around: messageId });
      if (!data.some((message) => message.id === messageId)) return false;
      setMessages(data);
      setHasOlder(true);
      return true;
    },
    [groupId, channelId]
  );

  const addMessage = useCallback((message: GroupMessage) => {
    setMessages((current) => mergeById(current, [message]));
  }, []);

  const loadOlder = useCallback(async () => {
    if (messages.length === 0 || channelId === null) return;
    setLoadingOlder(true);
    try {
      const older = await groupService.getMessages(groupId, { channelId, before: messages[0].id });
      setMessages((current) => [...older, ...current]);
      setHasOlder(older.length === PAGE_SIZE);
    } finally {
      setLoadingOlder(false);
    }
  }, [groupId, channelId, messages]);

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
    toggleReaction,
    togglePin,
    votePoll,
    toggleSaved,
    loadAround,
    addMessage,
    loadOlder,
  };
}
