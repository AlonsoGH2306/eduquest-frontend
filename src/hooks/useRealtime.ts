import { useCallback, useEffect, useRef, useState } from 'react';
import { realtime, RealtimeEvent } from '../services/realtime';

const TYPING_VISIBLE_MS = 4000;
const TYPING_SEND_EVERY_MS = 2500;

export function useRealtimeEvents(handler: (event: RealtimeEvent) => void, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    return realtime.subscribe((event) => handlerRef.current(event));
  }, [enabled]);
}

export function useRealtimeConnected() {
  const [connected, setConnected] = useState(realtime.connected);
  useEffect(() => realtime.onStatus(setConnected), []);
  return connected;
}

export function useTyping(target: { groupId: number } | { userId: number } | null) {
  const [typing, setTyping] = useState<Record<number, { username: string; until: number }>>({});
  const lastSent = useRef(0);
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  const key = target ? ('groupId' in target ? `g${target.groupId}` : `u${target.userId}`) : null;

  useRealtimeEvents((event) => {
    if (event.type !== 'typing' || !target) return;
    const matches = 'groupId' in target ? event.groupId === target.groupId : !event.groupId && event.userId === target.userId;
    if (!matches) return;
    setTyping((current) => ({ ...current, [event.userId]: { username: event.username, until: Date.now() + TYPING_VISIBLE_MS } }));
  }, target !== null);

  useEffect(() => {
    setTyping({});
    lastSent.current = 0;
  }, [key]);

  useEffect(() => {
    if (Object.keys(typing).length === 0) return;
    const timer = window.setTimeout(() => {
      const now = Date.now();
      setTyping((current) => Object.fromEntries(Object.entries(current).filter(([, value]) => value.until > now)));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [typing]);

  const notifyTyping = useCallback(() => {
    const current = targetRef.current;
    if (!current) return;
    const now = Date.now();
    if (now - lastSent.current < TYPING_SEND_EVERY_MS) return;
    lastSent.current = now;
    realtime.send({ type: 'typing', ...current });
  }, []);

  const clearSelf = useCallback((userId: number) => {
    setTyping((current) => {
      if (!(userId in current)) return current;
      const next = { ...current };
      delete next[userId];
      return next;
    });
  }, []);

  return { typingNames: Object.values(typing).map((value) => value.username), notifyTyping, clearSelf };
}

export const typingLabel = (names: string[]) => {
  if (names.length === 0) return null;
  if (names.length === 1) return `@${names[0]} está escribiendo…`;
  if (names.length === 2) return `@${names[0]} y @${names[1]} están escribiendo…`;
  return 'Varias personas están escribiendo…';
};
