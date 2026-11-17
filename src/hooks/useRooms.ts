import { useCallback, useEffect, useState } from 'react';
import { roomService } from '../services/roomService';
import { ChatRoom } from '../types';
import { useRealtimeEvents } from './useRealtime';

export function useRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    roomService.getRooms(controller.signal).then(setRooms).catch(() => undefined);
    return () => controller.abort();
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useRealtimeEvents((event) => {
    if (event.type === 'room.updated' || (event.type === 'room.message' && event.action === 'created')) reload();
  });

  const clearUnread = useCallback((roomId: number) => {
    setRooms((current) => current.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room)));
  }, []);

  return { rooms, reload, clearUnread };
}
