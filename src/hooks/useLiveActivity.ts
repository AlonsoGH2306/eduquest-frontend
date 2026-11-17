import { useCallback, useEffect, useMemo, useState } from 'react';
import { groupService } from '../services/groupService';
import { GroupResponse, StudyRoom, StudySessionResponse, UserSummary } from '../types';
import { useRealtimeEvents } from './useRealtime';

const MAX_GROUPS = 8;
const REFRESH_MS = 60_000;

const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export interface LiveGroupState {
  group: GroupResponse;
  voice: UserSummary[];
  studyRoom: StudyRoom | null;
}

export function useLiveActivity(groups: GroupResponse[]) {
  const [live, setLive] = useState<Record<number, { voice: UserSummary[]; studyRoom: StudyRoom | null }>>({});
  const [sessions, setSessions] = useState<StudySessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const watched = useMemo(() => groups.slice(0, MAX_GROUPS), [groups]);
  const watchedKey = watched.map((group) => group.id).join(',');

  useEffect(() => {
    const controller = new AbortController();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const ids = watchedKey ? watchedKey.split(',').map(Number) : [];

    Promise.all([
      groupService.getMySessions(isoDay(today), isoDay(tomorrow), controller.signal).catch(() => []),
      ...ids.map((id) =>
        Promise.all([
          groupService.getVoice(id, controller.signal).catch(() => null),
          groupService.getStudyRoom(id, controller.signal).catch(() => null),
        ]).then(([voice, studyRoom]) => ({ id, voice: voice?.participants ?? [], studyRoom }))
      ),
    ])
      .then(([todaySessions, ...states]) => {
        if (controller.signal.aborted) return;
        setSessions((todaySessions as StudySessionResponse[]).filter((session) => !session.finished));
        const next: Record<number, { voice: UserSummary[]; studyRoom: StudyRoom | null }> = {};
        for (const state of states as { id: number; voice: UserSummary[]; studyRoom: StudyRoom | null }[]) {
          next[state.id] = { voice: state.voice, studyRoom: state.studyRoom };
        }
        setLive(next);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [watchedKey, reloadKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!document.hidden) setReloadKey((key) => key + 1);
    }, REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  useRealtimeEvents(
    useCallback((event) => {
      if (event.type === 'group.voice') {
        setLive((current) => ({
          ...current,
          [event.groupId]: { voice: event.participants as UserSummary[], studyRoom: current[event.groupId]?.studyRoom ?? null },
        }));
      } else if (event.type === 'group.studyroom') {
        setLive((current) => ({
          ...current,
          [event.groupId]: { voice: current[event.groupId]?.voice ?? [], studyRoom: event.room as StudyRoom },
        }));
      }
    }, [])
  );

  const studyRooms = watched
    .map((group) => ({ group, voice: live[group.id]?.voice ?? [], studyRoom: live[group.id]?.studyRoom ?? null }))
    .filter((state) => state.studyRoom?.active);
  const voiceRooms = watched
    .map((group) => ({ group, voice: live[group.id]?.voice ?? [], studyRoom: live[group.id]?.studyRoom ?? null }))
    .filter((state) => state.voice.length > 0);
  const peopleStudying = new Set(
    [...studyRooms.flatMap((state) => state.studyRoom?.participants ?? []), ...voiceRooms.flatMap((state) => state.voice)].map(
      (person) => person.id
    )
  ).size;

  return { studyRooms, voiceRooms, sessions, peopleStudying, loading };
}
