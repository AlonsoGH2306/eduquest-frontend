import { useCallback, useEffect, useState } from 'react';
import { groupService } from '../services/groupService';
import { ChannelSettings, GroupChannel, GroupMessage } from '../types';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { useAuth } from './useAuth';
import { useRealtimeEvents } from './useRealtime';

const mentions = (message: GroupMessage, username?: string) =>
  Boolean(username) && message.content.toLowerCase().includes(`@${username!.toLowerCase()}`);

export function useGroupChannels(groupId: number, activeChannelId: number | null) {
  const { user } = useAuth();
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setChannels(await groupService.getChannels(groupId, signal));
        setError(null);
      } catch (err) {
        if (!isCanceledError(err)) setError(extractErrorMessage(err));
      }
    },
    [groupId]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [load]);

  useRealtimeEvents((event) => {
    if (event.type === 'group.channels' && event.groupId === groupId) {
      void load();
      return;
    }
    if (event.type !== 'group.message' || event.groupId !== groupId || event.action !== 'created') return;
    const message = event.message as GroupMessage;
    const viewing = activeChannelId ?? channels[0]?.id ?? null;
    if (message.authorId === user?.id || message.threadRootId || event.channelId === viewing) return;
    setChannels((current) =>
      current.map((channel) =>
        channel.id === event.channelId
          ? {
              ...channel,
              unreadCount: channel.unreadCount + 1,
              mentionCount: channel.mentionCount + (mentions(message, user?.username) ? 1 : 0),
            }
          : channel
      )
    );
  });

  const markRead = useCallback(
    (channelId: number) => {
      setChannels((current) =>
        current.map((channel) => (channel.id === channelId ? { ...channel, unreadCount: 0, mentionCount: 0 } : channel))
      );
      groupService.markChannelRead(groupId, channelId).catch(() => undefined);
    },
    [groupId]
  );

  const createChannel = useCallback(
    async (settings: ChannelSettings) => {
      const created = await groupService.createChannel(groupId, settings);
      setChannels((current) => [...current.filter((channel) => channel.id !== created.id), created]);
      return created;
    },
    [groupId]
  );

  const updateChannel = useCallback(
    async (channelId: number, settings: ChannelSettings) => {
      const updated = await groupService.updateChannel(groupId, channelId, settings);
      setChannels((current) => current.map((channel) => (channel.id === updated.id ? updated : channel)));
      return updated;
    },
    [groupId]
  );

  const deleteChannel = useCallback(
    async (channelId: number) => {
      await groupService.deleteChannel(groupId, channelId);
      setChannels((current) => current.filter((channel) => channel.id !== channelId));
    },
    [groupId]
  );

  return { channels, loading, error, markRead, createChannel, updateChannel, deleteChannel };
}
