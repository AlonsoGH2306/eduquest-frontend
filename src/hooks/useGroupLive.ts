import { useCallback, useEffect, useState } from 'react';
import { groupService } from '../services/groupService';
import { StudyRoom, UserSummary, VoiceRoom } from '../types';
import { useRealtimeEvents } from './useRealtime';

export function useGroupLive(groupId: number, enabled: boolean) {
  const [voice, setVoice] = useState<VoiceRoom>({ url: null, participants: [] });
  const [studyRoom, setStudyRoom] = useState<StudyRoom | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    groupService.getVoice(groupId, controller.signal).then(setVoice).catch(() => undefined);
    groupService.getStudyRoom(groupId, controller.signal).then(setStudyRoom).catch(() => undefined);
    return () => controller.abort();
  }, [groupId, enabled]);

  useRealtimeEvents((event) => {
    if (event.type === 'group.voice' && event.groupId === groupId) {
      setVoice((current) => ({ ...current, participants: event.participants as UserSummary[] }));
    } else if (event.type === 'group.studyroom' && event.groupId === groupId) {
      setStudyRoom(event.room as StudyRoom);
    }
  }, enabled);

  const setInVoice = useCallback(
    async (inVoice: boolean) => {
      const updated = await groupService.setInVoice(groupId, inVoice);
      setVoice(updated);
      return updated;
    },
    [groupId]
  );

  const startStudyRoom = useCallback(
    async (focusMinutes: number, breakMinutes: number) => setStudyRoom(await groupService.startStudyRoom(groupId, focusMinutes, breakMinutes)),
    [groupId]
  );

  const studyRoomAction = useCallback(
    async (action: 'join' | 'leave' | 'stop') => setStudyRoom(await groupService.studyRoomAction(groupId, action)),
    [groupId]
  );

  return { voice, setInVoice, studyRoom, startStudyRoom, studyRoomAction };
}
