import { axiosInstance } from './axiosInstance';
import {
  ChannelSettings,
  ChannelSummary,
  DocumentRequest,
  DocumentResponse,
  GroupAppearance,
  GroupChannel,
  GroupInvite,
  GroupMember,
  GroupMessage,
  GroupRequest,
  GroupResponse,
  GroupThread,
  GroupUpdateRequest,
  PageResponse,
  PollRequest,
  SavedMessage,
  SendMessagePayload,
  SessionReviewRequest,
  SessionReviewResponse,
  StudyRoom,
  StudySessionRequest,
  StudySessionResponse,
  VoiceRoom,
} from '../types';

export const groupService = {
  async getAllGroups(
    page = 0,
    size = 10,
    signal?: AbortSignal,
    search?: string
  ): Promise<PageResponse<GroupResponse>> {
    const params: Record<string, string | number> = { page, size };
    if (search?.trim()) params.search = search.trim();
    const { data } = await axiosInstance.get<PageResponse<GroupResponse>>('/groups', { params, signal });
    return data;
  },

  async getMyGroups(signal?: AbortSignal): Promise<GroupResponse[]> {
    const { data } = await axiosInstance.get<GroupResponse[]>('/groups/mine', { signal });
    return data;
  },

  async markGroupSeen(groupId: number): Promise<void> {
    await axiosInstance.post(`/groups/${groupId}/seen`);
  },

  async getGroupById(groupId: number, signal?: AbortSignal): Promise<GroupResponse> {
    const { data } = await axiosInstance.get<GroupResponse>(`/groups/${groupId}`, { signal });
    return data;
  },

  async getGroupByCode(code: string, signal?: AbortSignal): Promise<GroupResponse> {
    const { data } = await axiosInstance.get<GroupResponse>(
      `/groups/code/${encodeURIComponent(code.trim().toUpperCase())}`,
      { signal }
    );
    return data;
  },

  async createGroup(payload: GroupRequest): Promise<GroupResponse> {
    const { data } = await axiosInstance.post<GroupResponse>('/groups', payload);
    return data;
  },

  async joinGroup(groupId: number, password?: string, inviteToken?: string): Promise<GroupResponse> {
    const body = password !== undefined || inviteToken ? { password, inviteToken } : undefined;
    const { data } = await axiosInstance.post<GroupResponse>(`/groups/${groupId}/join`, body);
    return data;
  },

  async createInvite(groupId: number, regenerate = false): Promise<GroupInvite> {
    const { data } = await axiosInstance.post<GroupInvite>(`/groups/${groupId}/invite`, null, {
      params: { regenerate },
    });
    return data;
  },

  async changePassword(groupId: number, password: string): Promise<void> {
    await axiosInstance.put(`/groups/${groupId}/password`, { password });
  },

  async getGroupMembers(groupId: number, signal?: AbortSignal): Promise<GroupMember[]> {
    const { data } = await axiosInstance.get<GroupMember[]>(`/groups/${groupId}/members`, { signal });
    return data;
  },

  async getGroupDocuments(
    groupId: number,
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<DocumentResponse>> {
    const { data } = await axiosInstance.get<PageResponse<DocumentResponse>>(
      `/groups/${groupId}/documents`,
      {
        params: { page, size },
        signal,
      }
    );
    return data;
  },

  async uploadDocumentToGroup(
    groupId: number,
    payload: DocumentRequest
  ): Promise<DocumentResponse> {
    const { data } = await axiosInstance.post<DocumentResponse>(
      `/groups/${groupId}/documents`,
      payload
    );
    return data;
  },

  async getGroupSessions(
    groupId: number,
    signal?: AbortSignal
  ): Promise<StudySessionResponse[]> {
    const { data } = await axiosInstance.get<StudySessionResponse[]>(
      `/groups/${groupId}/sessions`,
      { signal }
    );
    return data;
  },

  async updateSession(
    groupId: number,
    sessionId: number,
    payload: StudySessionRequest
  ): Promise<StudySessionResponse> {
    const { data } = await axiosInstance.put<StudySessionResponse>(
      `/groups/${groupId}/sessions/${sessionId}`,
      payload
    );
    return data;
  },

  async deleteSession(groupId: number, sessionId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}/sessions/${sessionId}`);
  },

  async scheduleSession(
    groupId: number,
    payload: StudySessionRequest
  ): Promise<StudySessionResponse> {
    const { data } = await axiosInstance.post<StudySessionResponse>(
      `/groups/${groupId}/sessions`,
      payload
    );
    return data;
  },

  async getMySessions(from: string, to: string, signal?: AbortSignal): Promise<StudySessionResponse[]> {
    const { data } = await axiosInstance.get<StudySessionResponse[]>('/sessions/mine', { params: { from, to }, signal });
    return data;
  },

  async checkIn(groupId: number, sessionId: number): Promise<StudySessionResponse> {
    const { data } = await axiosInstance.post<StudySessionResponse>(`/groups/${groupId}/sessions/${sessionId}/check-in`);
    return data;
  },

  async setAttendance(groupId: number, sessionId: number, attending: boolean): Promise<StudySessionResponse> {
    const url = `/groups/${groupId}/sessions/${sessionId}/attendance`;
    const { data } = attending
      ? await axiosInstance.post<StudySessionResponse>(url)
      : await axiosInstance.delete<StudySessionResponse>(url);
    return data;
  },

  async getSessionReviews(
    groupId: number,
    sessionId: number,
    signal?: AbortSignal
  ): Promise<SessionReviewResponse[]> {
    const { data } = await axiosInstance.get<SessionReviewResponse[]>(
      `/groups/${groupId}/sessions/${sessionId}/reviews`,
      { signal }
    );
    return data;
  },

  async reviewSession(
    groupId: number,
    sessionId: number,
    payload: SessionReviewRequest
  ): Promise<SessionReviewResponse> {
    const { data } = await axiosInstance.post<SessionReviewResponse>(
      `/groups/${groupId}/sessions/${sessionId}/reviews`,
      payload
    );
    return data;
  },

  async updateRecording(groupId: number, sessionId: number, recordingUrl: string): Promise<StudySessionResponse> {
    const { data } = await axiosInstance.put<StudySessionResponse>(
      `/groups/${groupId}/sessions/${sessionId}/recording`,
      { recordingUrl }
    );
    return data;
  },

  async getMessages(
    groupId: number,
    cursor: { channelId?: number; after?: number; before?: number; around?: number } = {},
    signal?: AbortSignal
  ): Promise<GroupMessage[]> {
    const { data } = await axiosInstance.get<GroupMessage[]>(`/groups/${groupId}/messages`, {
      params: cursor,
      signal,
    });
    return data;
  },

  async updateGroup(groupId: number, payload: GroupUpdateRequest): Promise<GroupResponse> {
    const { data } = await axiosInstance.put<GroupResponse>(`/groups/${groupId}`, payload);
    return data;
  },

  async updateAppearance(groupId: number, payload: GroupAppearance): Promise<GroupResponse> {
    const { data } = await axiosInstance.put<GroupResponse>(`/groups/${groupId}/appearance`, payload);
    return data;
  },

  async deleteGroup(groupId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}`);
  },

  async leaveGroup(groupId: number): Promise<void> {
    await axiosInstance.post(`/groups/${groupId}/leave`);
  },

  async removeMember(groupId: number, memberId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}/members/${memberId}`);
  },

  async markChatSeen(groupId: number): Promise<void> {
    await axiosInstance.post(`/groups/${groupId}/messages/seen`);
  },

  async sendMessage(groupId: number, payload: SendMessagePayload): Promise<GroupMessage> {
    const { data } = await axiosInstance.post<GroupMessage>(`/groups/${groupId}/messages`, payload);
    return data;
  },

  async toggleReaction(groupId: number, messageId: number, emoji: string): Promise<GroupMessage> {
    const { data } = await axiosInstance.post<GroupMessage>(`/groups/${groupId}/messages/${messageId}/reactions`, { emoji });
    return data;
  },

  async setPinned(groupId: number, messageId: number, pinned: boolean): Promise<GroupMessage> {
    const { data } = await axiosInstance.put<GroupMessage>(`/groups/${groupId}/messages/${messageId}/pin`, null, {
      params: { pinned },
    });
    return data;
  },

  async getPinned(groupId: number, channelId: number, signal?: AbortSignal): Promise<GroupMessage[]> {
    const { data } = await axiosInstance.get<GroupMessage[]>(`/groups/${groupId}/messages/pins`, {
      params: { channelId },
      signal,
    });
    return data;
  },

  async getThread(groupId: number, messageId: number, signal?: AbortSignal): Promise<GroupThread> {
    const { data } = await axiosInstance.get<GroupThread>(`/groups/${groupId}/messages/${messageId}/thread`, { signal });
    return data;
  },

  async searchMessages(groupId: number, query: string, channelId?: number, signal?: AbortSignal): Promise<GroupMessage[]> {
    const { data } = await axiosInstance.get<GroupMessage[]>(`/groups/${groupId}/messages/search`, {
      params: { q: query, channelId },
      signal,
    });
    return data;
  },

  async createPoll(groupId: number, payload: PollRequest): Promise<GroupMessage> {
    const { data } = await axiosInstance.post<GroupMessage>(`/groups/${groupId}/polls`, payload);
    return data;
  },

  async votePoll(groupId: number, pollId: number, optionId: number | null): Promise<GroupMessage> {
    const { data } = await axiosInstance.post<GroupMessage>(`/groups/${groupId}/polls/${pollId}/vote`, { optionId });
    return data;
  },

  async getChannels(groupId: number, signal?: AbortSignal): Promise<GroupChannel[]> {
    const { data } = await axiosInstance.get<GroupChannel[]>(`/groups/${groupId}/channels`, { signal });
    return data;
  },

  async createChannel(groupId: number, settings: ChannelSettings): Promise<GroupChannel> {
    const { data } = await axiosInstance.post<GroupChannel>(`/groups/${groupId}/channels`, settings);
    return data;
  },

  async updateChannel(groupId: number, channelId: number, settings: ChannelSettings): Promise<GroupChannel> {
    const { data } = await axiosInstance.put<GroupChannel>(`/groups/${groupId}/channels/${channelId}`, settings);
    return data;
  },

  async deleteChannel(groupId: number, channelId: number): Promise<void> {
    await axiosInstance.delete(`/groups/${groupId}/channels/${channelId}`);
  },

  async setModerator(groupId: number, memberId: number, moderator: boolean): Promise<void> {
    await axiosInstance.put(`/groups/${groupId}/members/${memberId}/moderator`, null, { params: { moderator } });
  },

  async setMuted(groupId: number, muted: boolean): Promise<void> {
    await axiosInstance.put(`/groups/${groupId}/mute`, null, { params: { muted } });
  },

  async getVoiceRoom(groupId: number): Promise<string> {
    const { data } = await axiosInstance.get<{ url: string }>(`/groups/${groupId}/voice-room`);
    return data.url;
  },

  async markChannelRead(groupId: number, channelId: number): Promise<void> {
    await axiosInstance.post(`/groups/${groupId}/channels/${channelId}/read`);
  },

  async summarizeChannel(groupId: number, channelId: number): Promise<ChannelSummary> {
    const { data } = await axiosInstance.get<ChannelSummary>(`/groups/${groupId}/messages/summary`, {
      params: { channelId },
      timeout: 60000,
    });
    return data;
  },

  async setSaved(groupId: number, messageId: number, saved: boolean): Promise<GroupMessage> {
    const { data } = await axiosInstance.put<GroupMessage>(`/groups/${groupId}/messages/${messageId}/saved`, null, {
      params: { saved },
    });
    return data;
  },

  async getSavedMessages(signal?: AbortSignal): Promise<SavedMessage[]> {
    const { data } = await axiosInstance.get<SavedMessage[]>('/users/me/saved-messages', { signal });
    return data;
  },

  async getModeration(groupId: number, signal?: AbortSignal): Promise<string[]> {
    const { data } = await axiosInstance.get<{ bannedWords: string[] }>(`/groups/${groupId}/moderation`, { signal });
    return data.bannedWords;
  },

  async updateModeration(groupId: number, bannedWords: string[]): Promise<string[]> {
    const { data } = await axiosInstance.put<{ bannedWords: string[] }>(`/groups/${groupId}/moderation`, { bannedWords });
    return data.bannedWords;
  },

  async getVoice(groupId: number, signal?: AbortSignal): Promise<VoiceRoom> {
    const { data } = await axiosInstance.get<VoiceRoom>(`/groups/${groupId}/voice`, { signal });
    return data;
  },

  async setInVoice(groupId: number, inVoice: boolean): Promise<VoiceRoom> {
    const { data } = await axiosInstance.post<VoiceRoom>(`/groups/${groupId}/voice/${inVoice ? 'join' : 'leave'}`);
    return data;
  },

  async getStudyRoom(groupId: number, signal?: AbortSignal): Promise<StudyRoom> {
    const { data } = await axiosInstance.get<StudyRoom>(`/groups/${groupId}/study-room`, { signal });
    return data;
  },

  async studyRoomAction(groupId: number, action: 'join' | 'leave' | 'stop'): Promise<StudyRoom> {
    const { data } = await axiosInstance.post<StudyRoom>(`/groups/${groupId}/study-room/${action}`);
    return data;
  },

  async startStudyRoom(groupId: number, focusMinutes: number, breakMinutes: number): Promise<StudyRoom> {
    const { data } = await axiosInstance.post<StudyRoom>(`/groups/${groupId}/study-room/start`, { focusMinutes, breakMinutes });
    return data;
  },

  async downloadCalendar(): Promise<Blob> {
    const { data } = await axiosInstance.get<Blob>('/sessions/mine/calendar.ics', { responseType: 'blob' });
    return data;
  },

  async getOnlineMembers(groupId: number, signal?: AbortSignal): Promise<number[]> {
    const { data } = await axiosInstance.get<{ userIds: number[] }>(`/groups/${groupId}/online`, { signal });
    return data.userIds;
  },

  async editMessage(groupId: number, messageId: number, content: string): Promise<GroupMessage> {
    const { data } = await axiosInstance.put<GroupMessage>(`/groups/${groupId}/messages/${messageId}`, { content });
    return data;
  },

  async deleteMessage(groupId: number, messageId: number): Promise<GroupMessage> {
    const { data } = await axiosInstance.delete<GroupMessage>(`/groups/${groupId}/messages/${messageId}`);
    return data;
  },
};
