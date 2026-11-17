import { useCallback, useState } from 'react';
import { groupService } from '../services/groupService';
import {
  DocumentRequest,
  GroupAppearance,
  GroupMember,
  GroupResponse,
  GroupUpdateRequest,
  SessionReviewRequest,
  StudySessionRequest,
  StudySessionResponse,
} from '../types';
import { useFetch } from './useFetch';
import { usePaginatedFetch } from './usePaginatedFetch';

export type GroupTab = 'docs' | 'sessions' | 'chat' | 'members';

export function useGroupDetail(groupId: number, page: number, size: number, activeTab: GroupTab, initialGroup?: GroupResponse) {
  const [joinedGroup, setJoinedGroup] = useState<GroupResponse | null>(null);

  const fetchGroup = useCallback((signal: AbortSignal) => groupService.getGroupById(groupId, signal), [groupId]);
  const groupQuery = useFetch(fetchGroup, { initialData: initialGroup });

  const fetchDocuments = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      groupService.getGroupDocuments(groupId, pageNumber, pageSize, signal),
    [groupId]
  );
  const documents = usePaginatedFetch(fetchDocuments, page, size);

  const group = joinedGroup ?? groupQuery.data ?? null;
  const isForbidden = documents.errorStatus === 403;
  const isMember = !isForbidden && (group ? group.member : true);

  const fetchSessions = useCallback((signal: AbortSignal) => groupService.getGroupSessions(groupId, signal), [groupId]);
  const sessions = useFetch(fetchSessions, { enabled: isMember && activeTab === 'sessions' });

  const fetchMembers = useCallback((signal: AbortSignal) => groupService.getGroupMembers(groupId, signal), [groupId]);
  const members = useFetch(fetchMembers, { enabled: isMember });

  const { reload: reloadDocuments } = documents;
  const { reload: reloadSessions, setData: setSessions } = sessions;

  const replaceSession = useCallback(
    (updated: StudySessionResponse) =>
      setSessions((previous) => (previous ?? []).map((session) => (session.id === updated.id ? updated : session))),
    [setSessions]
  );

  const markJoined = useCallback(
    (joined: GroupResponse) => {
      setJoinedGroup(joined);
      reloadDocuments();
    },
    [reloadDocuments]
  );

  const join = useCallback(async () => {
    const joined = await groupService.joinGroup(groupId);
    markJoined(joined);
    return joined;
  }, [groupId, markJoined]);

  const joinWithPassword = useCallback(
    (targetId: number, password: string) => groupService.joinGroup(targetId, password),
    []
  );

  const uploadDocument = useCallback(
    async (payload: DocumentRequest) => {
      const created = await groupService.uploadDocumentToGroup(groupId, payload);
      reloadDocuments();
      return created;
    },
    [groupId, reloadDocuments]
  );

  const saveSession = useCallback(
    async (payload: StudySessionRequest, sessionId?: number) => {
      const saved = sessionId
        ? await groupService.updateSession(groupId, sessionId, payload)
        : await groupService.scheduleSession(groupId, payload);
      reloadSessions();
      return saved;
    },
    [groupId, reloadSessions]
  );

  const deleteSession = useCallback(
    async (sessionId: number) => {
      await groupService.deleteSession(groupId, sessionId);
      reloadSessions();
    },
    [groupId, reloadSessions]
  );

  const toggleAttendance = useCallback(
    async (session: StudySessionResponse) => {
      replaceSession(await groupService.setAttendance(groupId, session.id, !session.attending));
    },
    [groupId, replaceSession]
  );

  const checkIn = useCallback(
    async (session: StudySessionResponse) => {
      replaceSession(await groupService.checkIn(groupId, session.id));
    },
    [groupId, replaceSession]
  );

  const reviewSession = useCallback(
    async (session: StudySessionResponse, payload: SessionReviewRequest) => {
      const review = await groupService.reviewSession(groupId, session.id, payload);
      const count = session.reviewCount + 1;
      replaceSession({
        ...session,
        reviewCount: count,
        averageRating: ((session.averageRating ?? 0) * session.reviewCount + payload.rating) / count,
        reviewedByMe: true,
        canReview: false,
      });
      return review;
    },
    [groupId, replaceSession]
  );

  const updateRecording = useCallback(
    async (session: StudySessionResponse, recordingUrl: string) => {
      replaceSession(await groupService.updateRecording(groupId, session.id, recordingUrl));
    },
    [groupId, replaceSession]
  );

  const { setData: setMembers } = members;

  const updateGroup = useCallback(
    async (payload: GroupUpdateRequest) => {
      const updated = await groupService.updateGroup(groupId, payload);
      setJoinedGroup(updated);
      return updated;
    },
    [groupId]
  );

  const updateAppearance = useCallback(
    async (payload: GroupAppearance) => {
      const updated = await groupService.updateAppearance(groupId, payload);
      setJoinedGroup(updated);
      return updated;
    },
    [groupId]
  );

  const removeMember = useCallback(
    async (member: GroupMember) => {
      await groupService.removeMember(groupId, member.id);
      setMembers((previous) => (previous ?? []).filter((item) => item.id !== member.id));
      if (group) setJoinedGroup({ ...group, memberCount: Math.max(group.memberCount - 1, 1) });
    },
    [groupId, group, setMembers]
  );

  const setModerator = useCallback(
    async (member: GroupMember, moderator: boolean) => {
      await groupService.setModerator(groupId, member.id, moderator);
      setMembers((previous) =>
        (previous ?? []).map((item) =>
          item.id === member.id ? { ...item, groupRole: moderator ? 'MODERATOR' : 'MEMBER' } : item
        )
      );
    },
    [groupId, setMembers]
  );

  const setMuted = useCallback(
    async (muted: boolean) => {
      await groupService.setMuted(groupId, muted);
      if (group) setJoinedGroup({ ...group, muted });
    },
    [groupId, group]
  );

  const sortedSessions = [...(sessions.data ?? [])].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return {
    group,
    groupNotFound: groupQuery.errorStatus === 404 && !group,
    isMember,
    documents,
    sessions: sortedSessions,
    sessionsLoading: sessions.loading,
    sessionsError: sessions.error,
    members: members.data ?? [],
    membersLoading: members.loading,
    membersError: members.error,
    markJoined,
    join,
    joinWithPassword,
    uploadDocument,
    saveSession,
    deleteSession,
    toggleAttendance,
    checkIn,
    reviewSession,
    updateRecording,
    reloadSessions,
    reloadMembers: members.reload,
    updateGroup,
    updateAppearance,
    removeMember,
    setModerator,
    setMuted,
  };
}
