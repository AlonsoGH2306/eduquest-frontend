import { axiosInstance } from './axiosInstance';
import {
  DocumentRequest,
  DocumentResponse,
  GroupInvite,
  GroupMember,
  GroupMessage,
  GroupRequest,
  GroupResponse,
  PageResponse,
  SessionReviewRequest,
  SessionReviewResponse,
  StudySessionRequest,
  StudySessionResponse,
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
    cursor: { after?: number; before?: number } = {},
    signal?: AbortSignal
  ): Promise<GroupMessage[]> {
    const { data } = await axiosInstance.get<GroupMessage[]>(`/groups/${groupId}/messages`, {
      params: cursor,
      signal,
    });
    return data;
  },

  async markChatSeen(groupId: number): Promise<void> {
    await axiosInstance.post(`/groups/${groupId}/messages/seen`);
  },

  async sendMessage(groupId: number, content: string): Promise<GroupMessage> {
    const { data } = await axiosInstance.post<GroupMessage>(`/groups/${groupId}/messages`, { content });
    return data;
  },
};
