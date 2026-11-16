import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { personalService } from '../services/personalService';
import { PinnedChat, PinnedChatKind } from '../types';
import { extractErrorMessage } from '../utils/errors';

export function usePinnedChats() {
  const [pins, setPins] = useState<PinnedChat[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    personalService.getPinnedChats(controller.signal).then(setPins).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const isPinned = useCallback(
    (kind: PinnedChatKind, targetId: number) => pins.some((pin) => pin.kind === kind && pin.targetId === targetId),
    [pins]
  );

  const togglePin = useCallback(
    async (kind: PinnedChatKind, targetId: number) => {
      try {
        setPins(await personalService.setPinned(kind, targetId, !isPinned(kind, targetId)));
      } catch (err) {
        toast.error(extractErrorMessage(err));
      }
    },
    [isPinned]
  );

  const sortPinnedFirst = useCallback(
    <T,>(items: T[], kind: PinnedChatKind, idOf: (item: T) => number) => {
      const order = new Map(pins.filter((pin) => pin.kind === kind).map((pin, index) => [pin.targetId, index]));
      return [...items].sort((a, b) => (order.get(idOf(a)) ?? Infinity) - (order.get(idOf(b)) ?? Infinity));
    },
    [pins]
  );

  return { isPinned, togglePin, sortPinnedFirst };
}
