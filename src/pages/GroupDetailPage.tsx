import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, CalendarDays, FileText, Lock, LogOut, Plus, Trash2, UserMinus, UserPlus, Users } from 'lucide-react';
import {
  ChannelSettings,
  DocumentRequest,
  DocumentResponse,
  GroupChannel,
  GroupMember,
  GroupResponse,
  StudySessionRequest,
  StudySessionResponse,
} from '../types';
import { groupService } from '../services/groupService';
import { useAuth } from '../hooks/useAuth';
import { GroupTab, useGroupDetail } from '../hooks/useGroupDetail';
import { usePageParams } from '../hooks/usePageParams';
import { useMyGroups } from '../hooks/useMyGroups';
import { extractErrorMessage } from '../utils/errors';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ReviewModal } from '../components/documents/ReviewModal';
import { ScheduleSessionModal } from '../components/groups/ScheduleSessionModal';
import { JoinPrivateGroupModal } from '../components/groups/JoinPrivateGroupModal';
import { SessionCard } from '../components/groups/SessionCard';
import { MemberList } from '../components/groups/MemberList';
import { useOnlineMembers } from '../hooks/useOnlineMembers';
import { useGroupLive } from '../hooks/useGroupLive';
import { StudyRoomCard } from '../components/groups/StudyRoomCard';
import { VisibilityBadge } from '../components/groups/VisibilityBadge';
import { GroupChat } from '../components/groups/GroupChat';
import { GroupMobileNav, GroupSidebar } from '../components/groups/GroupSidebar';
import { GroupMembersPanel } from '../components/groups/GroupMembersPanel';
import { GroupAppearanceModal } from '../components/groups/GroupAppearanceModal';
import { GroupAvatar, GroupBanner } from '../components/groups/GroupAvatar';
import { ChannelModal } from '../components/groups/ChannelModal';
import { Lumi } from '../components/brand/Lumi';
import { useGroupChannels } from '../hooks/useGroupChannels';
import { InviteModal } from '../components/groups/InviteModal';
import { EditGroupModal } from '../components/groups/EditGroupModal';
import { SessionReviewsModal } from '../components/groups/SessionReviewsModal';
import { RecordingModal } from '../components/groups/RecordingModal';
import { RecordingPlayerModal } from '../components/groups/RecordingPlayerModal';
import { ReportModal, ReportTarget } from '../components/reports/ReportModal';
import { orderSessions } from '../utils/sessionOrder';

const TABS: GroupTab[] = ['docs', 'sessions', 'chat', 'members'];

export const GroupDetailPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const numericGroupId = Number(groupId);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const groupFromState = (location.state as { group?: GroupResponse } | null)?.group;

  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const tabParam = searchParams.get('tab') as GroupTab | null;
  const activeTab: GroupTab = tabParam && TABS.includes(tabParam) ? tabParam : 'chat';

  const {
    group,
    groupNotFound,
    isMember,
    documents,
    sessions,
    sessionsLoading,
    sessionsError,
    members,
    membersLoading,
    membersError,
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
    reloadMembers,
    updateGroup,
    updateAppearance,
    removeMember,
    setModerator,
    setMuted,
  } = useGroupDetail(numericGroupId, page, size, activeTab, groupFromState);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySessionResponse | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<StudySessionResponse | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const [joining, setJoining] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [selectedDocForReview, setSelectedDocForReview] = useState<DocumentResponse | null>(null);
  const [attendanceBusyId, setAttendanceBusyId] = useState<number | null>(null);
  const [reviewingSession, setReviewingSession] = useState<StudySessionResponse | null>(null);
  const [recordingSession, setRecordingSession] = useState<StudySessionResponse | null>(null);
  const [watchingSession, setWatchingSession] = useState<StudySessionResponse | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [groupAction, setGroupAction] = useState<'delete' | 'leave' | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [channelModal, setChannelModal] = useState<{ open: boolean; channel: GroupChannel | null }>({ open: false, channel: null });
  const [channelToDelete, setChannelToDelete] = useState<GroupChannel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState(false);

  const { markSeen, markChatSeen, refresh: refreshMyGroups } = useMyGroups();
  const handleChatSeen = useCallback(() => {
    markChatSeen(numericGroupId).catch(() => undefined);
  }, [markChatSeen, numericGroupId]);

  useEffect(() => {
    if (!isMember || !group?.member) return;
    markSeen(numericGroupId).catch(() => undefined);
  }, [isMember, group?.member, numericGroupId, markSeen]);

  const groupName = group?.name ?? `Grupo #${numericGroupId}`;
  const isOwner = Boolean(group && user && group.creatorUsername === user.username);
  const canManageGroup = Boolean(group?.canManage) || isOwner;
  const channelParam = Number(searchParams.get('channel'));
  const activeChannelId = Number.isInteger(channelParam) && channelParam > 0 ? channelParam : null;
  const onlineMembers = useOnlineMembers(numericGroupId, isMember);
  const messageParam = Number(searchParams.get('message'));
  const focusMessageId = Number.isInteger(messageParam) && messageParam > 0 ? messageParam : null;
  const [joiningVoice, setJoiningVoice] = useState(false);
  const live = useGroupLive(numericGroupId, isMember);
  const inVoice = live.voice.participants.some((participant) => participant.id === user?.id);
  const channelState = useGroupChannels(numericGroupId, activeChannelId);
  const shownChannelId = activeChannelId ?? channelState.channels[0]?.id ?? null;

  const clearMessageParam = useCallback(() => updateParams({ message: null }), [updateParams]);

  const toggleVoice = async () => {
    if (inVoice) {
      try {
        await live.setInVoice(false);
      } catch (error) {
        toast.error(extractErrorMessage(error));
      }
      return;
    }
    const popup = window.open('', '_blank');
    setJoiningVoice(true);
    try {
      const { url } = await live.setInVoice(true);
      if (popup && url) {
        popup.opener = null;
        popup.location.href = url;
      } else if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      popup?.close();
      toast.error(extractErrorMessage(error));
    } finally {
      setJoiningVoice(false);
    }
  };

  const toggleMuted = async () => {
    const muted = !group?.muted;
    try {
      await setMuted(muted);
      toast.success(muted ? 'Grupo silenciado: no recibirás avisos de su actividad' : 'Volverás a recibir avisos del grupo');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const toggleModerator = async (member: GroupMember) => {
    const promote = member.groupRole !== 'MODERATOR';
    try {
      await setModerator(member, promote);
      toast.success(promote ? `@${member.username} ahora es moderador` : `@${member.username} ya no es moderador`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const confirmGroupAction = async () => {
    if (!groupAction) return;
    setActionBusy(true);
    try {
      if (groupAction === 'delete') {
        await groupService.deleteGroup(numericGroupId);
        toast.success('Grupo eliminado');
      } else {
        await groupService.leaveGroup(numericGroupId);
        toast.success('Saliste del grupo');
      }
      refreshMyGroups();
      navigate('/groups', { replace: true });
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setActionBusy(false);
      setGroupAction(null);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setActionBusy(true);
    try {
      await removeMember(memberToRemove);
      toast.success(`@${memberToRemove.username} ya no es parte del grupo`);
      setMemberToRemove(null);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setActionBusy(false);
    }
  };

  const changeTab = (tab: GroupTab) => updateParams({ tab: tab === 'chat' ? null : tab, message: null });

  const selectChannel = (channelId: number, messageId?: number) =>
    updateParams({ tab: null, channel: String(channelId), message: messageId ? String(messageId) : null });

  const saveChannel = async (settings: ChannelSettings) => {
    if (channelModal.channel) {
      await channelState.updateChannel(channelModal.channel.id, settings);
    } else {
      const created = await channelState.createChannel(settings);
      selectChannel(created.id);
    }
  };

  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    setDeletingChannel(true);
    try {
      await channelState.deleteChannel(channelToDelete.id);
      if (channelToDelete.id === shownChannelId) {
        const next = channelState.channels.find((channel) => channel.id !== channelToDelete.id);
        if (next) selectChannel(next.id);
      }
      toast.success(`Canal #${channelToDelete.name} eliminado`);
      setChannelToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setDeletingChannel(false);
    }
  };

  const handleJoin = async () => {
    if (group?.visibility === 'PRIVATE') {
      setAskPassword(true);
      return;
    }
    setJoining(true);
    try {
      await join();
      refreshMyGroups();
      toast.success('¡Ahora eres miembro de este grupo!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setJoining(false);
    }
  };

  const handleUpload = async (payload: DocumentRequest) => {
    try {
      await uploadDocument(payload);
      toast.success('¡Documento compartido en el grupo!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  const openSessionModal = (session: StudySessionResponse | null) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async (payload: StudySessionRequest) => {
    try {
      await saveSession(payload, editingSession?.id);
      toast.success(editingSession ? 'Sesión actualizada' : '¡Sesión de estudio programada!');
      if (activeTab !== 'sessions') changeTab('sessions');
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setDeletingSession(true);
    try {
      await deleteSession(sessionToDelete.id);
      toast.success('Sesión eliminada');
      setSessionToDelete(null);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setDeletingSession(false);
    }
  };

  const handleToggleAttendance = async (session: StudySessionResponse) => {
    setAttendanceBusyId(session.id);
    try {
      await toggleAttendance(session);
      toast.success(
        session.attending
          ? 'Cancelaste tu asistencia'
          : '¡Te esperamos! Entra con «Unirme ahora» cuando empiece para no perder puntos'
      );
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setAttendanceBusyId(null);
    }
  };

  const handleCheckIn = async (session: StudySessionResponse) => {
    setAttendanceBusyId(session.id);
    try {
      await checkIn(session);
      toast.success('¡Asistencia registrada! Ganaste 3 puntos');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setAttendanceBusyId(null);
    }
  };

  if (groupNotFound && documents.errorStatus !== 403) {
    return (
      <EmptyState
        title="No encontramos este grupo"
        description="Puede que lo hayan eliminado o que sea privado. Búscalo con su código en Grupos."
        actionLabel="Ir a Grupos"
        onAction={() => navigate('/groups')}
      />
    );
  }

  const renderDocuments = () => {
    if (documents.loading) return <SkeletonCard count={3} />;
    if (documents.error) return <ErrorState message={documents.error} onRetry={documents.reload} />;
    if (documents.items.length === 0) {
      return (
        <EmptyState
          title="Aún no hay documentos en este grupo"
          description="Comparte el primer apunte o guía exclusiva con los miembros del grupo."
          actionLabel="Subir documento al grupo"
          onAction={() => setIsUploadOpen(true)}
        />
      );
    }
    return (
      <>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.items.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onOpenReviews={setSelectedDocForReview}
              onChanged={documents.reload}
            />
          ))}
        </div>
        <PaginationBar
          page={page}
          size={size}
          totalElements={documents.totalElements}
          totalPages={documents.totalPages}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      </>
    );
  };

  const renderSessions = () => {
    if (sessionsLoading) return <SkeletonCard count={2} />;
    if (sessionsError) return <ErrorState message={sessionsError} onRetry={reloadSessions} />;
    if (sessions.length === 0) {
      return (
        <EmptyState
          title="No hay sesiones programadas"
          description="Agenda una reunión de repaso grupal con enlace a Google Meet, Zoom o Discord."
          actionLabel="Agendar sesión"
          onAction={() => openSessionModal(null)}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {orderSessions(sessions).map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            busy={attendanceBusyId === session.id}
            onEdit={openSessionModal}
            onDelete={setSessionToDelete}
            onToggleAttendance={handleToggleAttendance}
            onCheckIn={handleCheckIn}
            onOpenReviews={setReviewingSession}
            onEditRecording={setRecordingSession}
            onWatchRecording={setWatchingSession}
          />
        ))}
      </div>
    );
  };

  const renderMembers = () => {
    if (membersLoading) return <SkeletonCard count={2} />;
    if (membersError) return <ErrorState message={membersError} onRetry={reloadMembers} />;
    return (
      <MemberList
        members={members}
        currentUserId={user?.id}
        onMessage={(member) => navigate(`/messages/${member.id}`)}
        onlineIds={onlineMembers}
        onRemove={canManageGroup ? setMemberToRemove : undefined}
        canRemove={(member) => isOwner || member.groupRole === 'MEMBER'}
        onToggleModerator={isOwner ? (member) => void toggleModerator(member) : undefined}
        onReport={(member) => setReportTarget({ type: 'USER', id: member.id, label: member.username })}
      />
    );
  };

  const studyRoom = (
    <StudyRoomCard
      room={live.studyRoom}
      currentUserId={user?.id}
      canManage={canManageGroup}
      onStart={live.startStudyRoom}
      onAction={live.studyRoomAction}
    />
  );

  const navProps = {
    activeTab,
    activeChannelId: shownChannelId,
    channels: channelState.channels,
    documentsCount: documents.totalElements,
    memberCount: group?.memberCount ?? members.length,
    voice: live.voice.participants,
    inVoice,
    joiningVoice,
    onSelectTab: changeTab,
    onSelectChannel: (channelId: number) => selectChannel(channelId),
    onToggleVoice: () => void toggleVoice(),
  };

  const TAB_HEADER: Record<Exclude<GroupTab, 'chat'>, { title: string; Icon: React.ElementType }> = {
    docs: { title: 'Material del grupo', Icon: FileText },
    sessions: { title: 'Asesorías', Icon: CalendarDays },
    members: { title: 'Integrantes', Icon: Users },
  };

  const renderTabPanel = (tab: Exclude<GroupTab, 'chat'>) => {
    const { title, Icon } = TAB_HEADER[tab];
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 shadow-[0_1px_0_rgb(0_0_0/0.18)]">
          <Icon size={18} className="shrink-0 text-faint" />
          <h2 className="min-w-0 flex-1 truncate text-[15px] font-bold text-slate-900">{title}</h2>
          {tab === 'docs' && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Subir material
            </button>
          )}
          {tab === 'sessions' && (
            <button
              type="button"
              onClick={() => openSessionModal(null)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Calendar size={15} /> Agendar asesoría
            </button>
          )}
        </header>
        <div className="eq-scroll min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'docs' && renderDocuments()}
          {tab === 'sessions' && renderSessions()}
          {tab === 'members' && renderMembers()}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-h-0">
      {!isMember ? (
        <div className="eq-scroll h-full overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
            <Breadcrumbs items={[{ label: 'Grupos de estudio', to: '/groups' }, { label: groupName }]} />
            <div className="overflow-hidden rounded-3xl bg-raised">
              <GroupBanner group={group ?? { name: groupName }} className="h-36" />
              <div className="px-6 pb-8">
                <GroupAvatar
                  group={group ?? { name: groupName }}
                  size={80}
                  radius={26}
                  className="relative -mt-10 mb-3 ring-[6px] ring-[var(--eq-raised)]"
                />
                <h1 className="text-2xl break-words text-slate-900 sm:text-3xl">{groupName}</h1>
                <p className="mt-1 text-[15px] text-slate-600">
                  {group?.description || 'Un grupo de estudio de EduQuest con chat, material y asesorías.'}
                </p>
                {group && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <VisibilityBadge visibility={group.visibility} />
                    <span className="text-slate-500">
                      {group.memberCount === 1 ? '1 integrante' : `${group.memberCount} integrantes`}
                    </span>
                    {group.creatorUsername && <span className="text-slate-500">· Creado por @{group.creatorUsername}</span>}
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-5">
                  <Lumi mood="sleepy" size={64} animated={false} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">Contenido exclusivo para integrantes</p>
                    <p className="text-sm text-slate-600">
                      {group?.visibility === 'PRIVATE'
                        ? 'Es privado: necesitas la contraseña que te compartió su creador.'
                        : 'Únete para ver el chat, los apuntes y las asesorías del grupo.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joining}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-mint px-6 text-sm font-bold text-noche hover:brightness-105 disabled:opacity-50"
                  >
                    {group?.visibility === 'PRIVATE' ? <Lock size={16} /> : <UserPlus size={16} />}
                    {joining ? 'Uniéndote...' : 'Unirme al grupo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0">
          <GroupSidebar
            {...navProps}
            group={group}
            groupName={groupName}
            canManageChannels={canManageGroup || isAdmin}
            studyRoom={studyRoom}
            onCreateChannel={() => setChannelModal({ open: true, channel: null })}
            onEditChannel={(channel) => setChannelModal({ open: true, channel })}
            onDeleteChannel={setChannelToDelete}
            menu={{
              muted: Boolean(group?.muted),
              canCustomize: canManageGroup,
              canEdit: isOwner,
              canInvite: isOwner,
              canDelete: isOwner || isAdmin,
              canLeave: !isOwner,
              onCustomize: () => setAppearanceOpen(true),
              onEdit: () => setEditOpen(true),
              onInvite: () => setInviteOpen(true),
              onToggleMute: () => void toggleMuted(),
              onDelete: () => setGroupAction('delete'),
              onLeave: () => setGroupAction('leave'),
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col bg-canvas">
            <GroupMobileNav {...navProps} groupName={groupName} />
            {activeTab === 'chat' ? (
              <GroupChat
                groupId={numericGroupId}
                canManage={canManageGroup}
                members={members}
                channels={channelState.channels}
                channelsLoading={channelState.loading}
                channelsError={channelState.error}
                markRead={channelState.markRead}
                channelId={activeChannelId}
                messageId={focusMessageId}
                onChannelChange={selectChannel}
                onMessageShown={clearMessageParam}
                onSeen={handleChatSeen}
              />
            ) : (
              renderTabPanel(activeTab)
            )}
          </div>
          <GroupMembersPanel
            members={members}
            onlineIds={onlineMembers}
            voice={live.voice.participants}
            studyRoom={live.studyRoom}
            currentUserId={user?.id}
            canManage={canManageGroup}
            onStartStudy={live.startStudyRoom}
            onStudyAction={live.studyRoomAction}
          />
        </div>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmitDocument={handleUpload}
        modalTitle="Subir documento privado al grupo"
      />

      <ScheduleSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSchedule={handleSaveSession}
        session={editingSession}
      />

      <ReviewModal document={selectedDocForReview} onClose={() => setSelectedDocForReview(null)} />

      <SessionReviewsModal
        groupId={numericGroupId}
        session={reviewingSession}
        onClose={() => setReviewingSession(null)}
        onSubmitReview={reviewSession}
      />

      <RecordingModal session={recordingSession} onClose={() => setRecordingSession(null)} onSave={updateRecording} />

      <RecordingPlayerModal session={watchingSession} onClose={() => setWatchingSession(null)} />

      <ReportModal target={reportTarget} onClose={() => setReportTarget(null)} />

      <InviteModal group={inviteOpen ? group : null} onClose={() => setInviteOpen(false)} />

      <EditGroupModal group={editOpen ? group : null} onClose={() => setEditOpen(false)} onSave={updateGroup} />

      <GroupAppearanceModal
        group={appearanceOpen ? group : null}
        onClose={() => setAppearanceOpen(false)}
        onSave={async (payload) => {
          await updateAppearance(payload);
          refreshMyGroups();
        }}
      />

      <ChannelModal
        isOpen={channelModal.open}
        channel={channelModal.channel}
        onClose={() => setChannelModal({ open: false, channel: null })}
        onSave={saveChannel}
      />

      <ConfirmModal
        isOpen={channelToDelete !== null}
        title="Eliminar canal"
        message={`Se borrarán #${channelToDelete?.name ?? ''} y todos sus mensajes. No se puede deshacer.`}
        confirmLabel="Eliminar canal"
        loadingLabel="Eliminando..."
        destructive
        loading={deletingChannel}
        icon={<Trash2 size={14} />}
        onConfirm={() => void confirmDeleteChannel()}
        onClose={() => setChannelToDelete(null)}
      />

      <ConfirmModal
        isOpen={groupAction !== null}
        title={groupAction === 'delete' ? 'Eliminar grupo' : 'Salir del grupo'}
        message={
          groupAction === 'delete' ? (
            <>
              Se borrarán «<span className="font-semibold text-slate-900">{groupName}</span>», su material, sus sesiones
              y el chat para todos los miembros. Esta acción no se puede deshacer.
            </>
          ) : (
            <>
              Dejarás de ver el material, las sesiones y el chat de «
              <span className="font-semibold text-slate-900">{groupName}</span>».
              {group?.visibility === 'PRIVATE' && ' Para volver necesitarás la contraseña o una invitación.'}
            </>
          )
        }
        confirmLabel={groupAction === 'delete' ? 'Eliminar grupo' : 'Salir'}
        loadingLabel={groupAction === 'delete' ? 'Eliminando...' : 'Saliendo...'}
        destructive
        loading={actionBusy}
        icon={groupAction === 'delete' ? <Trash2 size={14} /> : <LogOut size={14} />}
        onConfirm={confirmGroupAction}
        onClose={() => setGroupAction(null)}
      />

      <ConfirmModal
        isOpen={memberToRemove !== null}
        title="Quitar del grupo"
        message={
          <>
            <span className="font-semibold text-slate-900">@{memberToRemove?.username}</span> dejará de tener acceso al
            grupo. Podrá volver a unirse con el código o una invitación.
          </>
        }
        confirmLabel="Quitar"
        loadingLabel="Quitando..."
        destructive
        loading={actionBusy}
        icon={<UserMinus size={14} />}
        onConfirm={confirmRemoveMember}
        onClose={() => setMemberToRemove(null)}
      />

      <ConfirmModal
        isOpen={sessionToDelete !== null}
        title="Eliminar sesión"
        message={
          <>
            «<span className="font-semibold text-slate-900">{sessionToDelete?.title}</span>» desaparecerá para todos
            los miembros del grupo. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        destructive
        loading={deletingSession}
        icon={<Trash2 size={14} />}
        onConfirm={handleDeleteSession}
        onClose={() => setSessionToDelete(null)}
      />

      <JoinPrivateGroupModal
        group={askPassword ? group : null}
        onClose={() => setAskPassword(false)}
        onJoin={joinWithPassword}
        onJoined={(joined) => {
          setAskPassword(false);
          markJoined(joined);
          refreshMyGroups();
        }}
      />
    </div>
  );
};
