export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  avatarUrl?: string | null;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  advisor?: boolean;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DocumentResponse {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  uploadedAt: string;
  authorUsername: string;
  groupName: string | null;
  course?: string | null;
  university?: string | null;
  tags: string[];
}

export interface DocumentRequest {
  title: string;
  description: string;
  fileUrl: string;
  tags?: string[];
  course?: string;
  university?: string;
}

export type GroupVisibility = 'PUBLIC' | 'PRIVATE';

export interface GroupResponse {
  id: number;
  name: string;
  description: string | null;
  creatorUsername: string;
  code: string;
  visibility: GroupVisibility;
  member: boolean;
  memberCount: number;
  lastActivityAt?: string | null;
  unreadDocuments?: number;
  unreadSessions?: number;
  unreadCount?: number;
  unreadMessages?: number;
}

export interface GroupInvite {
  code: string;
  token: string;
  expiresAt: string;
}

export interface GroupMember {
  id: number;
  username: string;
  avatarUrl: string | null;
  groupRole: 'CREATOR' | 'MEMBER';
  advisor?: boolean;
}

export interface GroupRequest {
  name: string;
  description: string;
  visibility: GroupVisibility;
  password?: string;
}

export interface StudySessionResponse {
  id: number;
  title: string;
  description: string | null;
  scheduledAt: string;
  meetingUrl: string | null;
  groupName: string | null;
  createdByUsername: string | null;
  canManage: boolean;
  createdByAdvisor: boolean;
  finished: boolean;
  attendeeCount: number;
  attending: boolean;
  averageRating: number | null;
  reviewCount: number;
  reviewedByMe: boolean;
  canReview: boolean;
  recordingUrl: string | null;
  recordingTitle: string | null;
  recordingVideoId: string | null;
}

export interface SessionReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  authorUsername: string;
  authorAvatarUrl: string | null;
  createdAt: string;
}

export interface SessionReviewRequest {
  rating: number;
  comment: string;
}

export interface GroupMessage {
  id: number;
  content: string;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorAdvisor: boolean;
  mine: boolean;
  createdAt: string;
}

export interface StudySessionRequest {
  title: string;
  description: string;
  scheduledAt: string;
  meetingUrl: string;
}

export interface StudyPlanResponse {
  id: number;
  courseName: string;
  difficulty: string;
  generatedContent: string;
  createdAt: string;
  totalSteps: number;
  completedSteps: number[];
}

export type Difficulty = 'Baja' | 'Media' | 'Alta';

export interface CourseInput {
  name: string;
  difficulty: Difficulty;
}

export interface StudyPlanRequest {
  courses: CourseInput[];
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorUsername: string;
  documentTitle: string;
}

export interface ReviewRequest {
  documentId: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdateRequest {
  rating: number;
  comment: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  avatarUrl?: string | null;
  advisor?: boolean;
  banned?: boolean;
  banReason?: string | null;
  bannedAt?: string | null;
}

export interface BanInfo {
  reason: string | null;
  bannedAt: string | null;
}

export type ReportTargetType = 'DOCUMENT' | 'USER';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
}

export interface ReportResponse {
  id: number;
  targetType: ReportTargetType;
  targetId: number;
  targetLabel: string | null;
  reason: string;
  status: ReportStatus;
  reporterUsername: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUsername: string | null;
}

export interface Badge {
  code: string;
  name: string;
  description: string;
  earned: boolean;
}

export interface GamificationProfile {
  points: number;
  weeklyPoints: number;
  rank: number | null;
  stats: {
    documents: number;
    reviews: number;
    sessionsHosted: number;
    attendances: number;
    sessionReviews: number;
  };
  badges: Badge[];
}

export type LeaderboardPeriod = 'week' | 'all';

export interface LeaderboardEntry {
  position: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  advisor: boolean;
  points: number;
}

export type NotificationType =
  | 'GROUP_MEMBER'
  | 'GROUP_DOCUMENT'
  | 'GROUP_SESSION'
  | 'DIRECT_MESSAGE'
  | 'BADGE'
  | 'ANNOUNCEMENT';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface UserSummary {
  id: number;
  username: string;
  avatarUrl: string | null;
  advisor: boolean;
}

export interface Conversation {
  partner: UserSummary;
  lastMessage: string;
  lastMessageMine: boolean;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DirectMessage {
  id: number;
  content: string;
  senderId: number;
  mine: boolean;
  read: boolean;
  createdAt: string;
}

export interface AnnouncementRequest {
  title: string;
  message: string;
  username?: string;
}
