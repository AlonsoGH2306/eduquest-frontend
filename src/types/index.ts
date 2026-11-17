export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  avatarUrl?: string | null;
  emailVerified?: boolean;
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
  authorId?: number;
  authorUsername: string;
  groupName: string | null;
  course?: string | null;
  university?: string | null;
  featured?: boolean;
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
  creatorUsername: string | null;
  code: string;
  visibility: GroupVisibility;
  member: boolean;
  memberCount: number;
  lastActivityAt?: string | null;
  unreadDocuments?: number;
  unreadSessions?: number;
  unreadCount?: number;
  unreadMessages?: number;
  muted?: boolean;
  canManage?: boolean;
  unreadMentions?: number;
  color?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
}

export interface GroupAppearance {
  color: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
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
  groupRole: 'CREATOR' | 'MODERATOR' | 'MEMBER';
  advisor?: boolean;
  availability?: Availability | null;
  statusText?: string | null;
  statusEmoji?: string | null;
}

export interface GroupRequest {
  name: string;
  description: string;
  visibility: GroupVisibility;
  password?: string;
  color?: string;
}

export interface StudySessionResponse {
  id: number;
  title: string;
  description: string | null;
  scheduledAt: string;
  endsAt: string;
  started: boolean;
  checkInOpen: boolean;
  checkedIn: boolean;
  checkedInCount: number;
  meetingUrl: string | null;
  groupId?: number | null;
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

export interface ChatReply {
  id: number;
  authorId: number;
  authorUsername: string;
  preview: string;
  deleted: boolean;
}

export interface ChatAttachment {
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  sticker?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: number[];
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  voterIds: number[];
}

export interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface GroupMessage {
  id: number;
  content: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  sticker?: string | null;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorAdvisor: boolean;
  mine: boolean;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  replyTo?: ChatReply | null;
  channelId?: number | null;
  threadRootId?: number | null;
  threadReplyCount?: number;
  pinned?: boolean;
  reactions?: MessageReaction[];
  poll?: Poll | null;
  saved?: boolean;
}

export interface GroupChannel {
  id: number;
  name: string;
  topic: string | null;
  position: number;
  readOnly: boolean;
  slowModeSeconds: number;
  unreadCount: number;
  mentionCount: number;
}

export interface ChannelSettings {
  name: string;
  topic?: string;
  readOnly?: boolean;
  slowModeSeconds?: number;
}

export type Availability = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'INVISIBLE';

export interface UserStatus {
  userId: number;
  availability: Availability;
  statusText: string | null;
  statusEmoji: string | null;
  online: boolean;
}

export interface StatusRequest {
  availability: Availability;
  statusText?: string;
  statusEmoji?: string;
}

export type PinnedChatKind = 'GROUP' | 'DIRECT' | 'ROOM';

export interface PinnedChat {
  kind: PinnedChatKind;
  targetId: number;
}

export interface SavedMessage {
  message: GroupMessage;
  groupId: number;
  groupName: string;
  channelName: string | null;
  savedAt: string;
}

export interface ChannelSummary {
  summary: string;
  messageCount: number;
  generatedByAi: boolean;
}

export interface VoiceRoom {
  url: string | null;
  participants: UserSummary[];
}

export interface StudyRoom {
  active: boolean;
  focusMinutes: number;
  breakMinutes: number;
  startedAt: string | null;
  serverTime: string;
  startedById: number | null;
  participants: UserSummary[];
}

export interface ChatRoom {
  id: number;
  name: string;
  members: UserSummary[];
  createdById: number;
  lastMessage: string | null;
  lastActivityAt: string;
  unreadCount: number;
}

export interface RoomMessage {
  id: number;
  content: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  sticker?: string | null;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl: string | null;
  mine: boolean;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  replyTo?: ChatReply | null;
}

export type StudySetType = 'QUIZ' | 'FLASHCARDS';

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudySet {
  documentId: number;
  type: StudySetType;
  questions: QuizQuestion[];
  cards: Flashcard[];
  generatedByAi: boolean;
  createdAt: string;
}

export interface SearchHit {
  id: number;
  title: string;
  subtitle: string | null;
}

export interface GlobalSearchResult {
  documents: SearchHit[];
  groups: SearchHit[];
  questions: SearchHit[];
  users: UserSummary[];
}

export interface GroupThread {
  root: GroupMessage;
  replies: GroupMessage[];
}

export interface Sticker {
  id: number;
  imageUrl: string;
}

export interface SendMessagePayload extends ChatAttachment {
  content: string;
  replyToId?: number;
  channelId?: number;
  threadRootId?: number;
}

export interface PollRequest {
  channelId?: number;
  question: string;
  options: string[];
}

export interface StudySessionRequest {
  title: string;
  description: string;
  scheduledAt: string;
  endsAt: string;
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
  bannedUntil?: string | null;
  availability?: Availability | null;
  statusText?: string | null;
  statusEmoji?: string | null;
}

export interface BanInfo {
  reason: string | null;
  bannedAt: string | null;
  bannedUntil?: string | null;
}

export type ForumFilter = 'all' | 'unanswered' | 'solved';

export interface ForumQuestion {
  id: number;
  title: string;
  body: string;
  course: string | null;
  author: UserSummary;
  createdAt: string;
  answerCount: number;
  solved: boolean;
  mine: boolean;
  canDelete: boolean;
}

export interface ForumAnswer {
  id: number;
  body: string;
  author: UserSummary;
  createdAt: string;
  score: number;
  myVote: number;
  accepted: boolean;
  mine: boolean;
  canDelete: boolean;
}

export interface ForumThread {
  question: ForumQuestion;
  answers: ForumAnswer[];
  canAccept: boolean;
}

export type AppealStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface BanAppeal {
  id: number;
  userId: number;
  username: string;
  banReason: string | null;
  bannedUntil: string | null;
  message: string;
  status: AppealStatus;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  response: string | null;
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
    confirmations: number;
    attendances: number;
    noShows: number;
    sessionReviews: number;
  };
  badges: Badge[];
}

export interface PublicProfile {
  id: number;
  username: string;
  avatarUrl: string | null;
  advisor: boolean;
  memberSince: string | null;
  points: number;
  weeklyPoints: number;
  rank: number | null;
  stats: GamificationProfile['stats'];
  badges: Badge[];
  followers: number;
  following: number;
  followedByMe: boolean;
  me: boolean;
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
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  sticker?: string | null;
  senderId: number;
  mine: boolean;
  read: boolean;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  replyTo?: ChatReply | null;
}

export interface AnnouncementRequest {
  title: string;
  message: string;
  username?: string;
}

export interface GroupUpdateRequest {
  name: string;
  description?: string;
}

export interface UploadedFile {
  url: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface AdminStats {
  users: number;
  newUsersThisWeek: number;
  suspendedUsers: number;
  documents: number;
  documentsThisWeek: number;
  groups: number;
  sessionsThisWeek: number;
  openReports: number;
}
