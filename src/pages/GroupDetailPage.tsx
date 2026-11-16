import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Bell,
  BellOff,
  Calendar,
  FileText,
  Headphones,
  Lock,
  LogOut,
  MessagesSquare,
  Pencil,
  Plus,
  Send,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  DocumentRequest,
  DocumentResponse,
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
import { TabButton } from '../components/common/TabButton';
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
import { UserAvatar } from '../components/common/UserAvatar';
import { VisibilityBadge } from '../components/groups/VisibilityBadge';
import { GroupChat } from '../components/groups/GroupChat';
import { InviteModal } from '../components/groups/InviteModal';
import { EditGroupModal } from '../components/groups/EditGroupModal';
import { SessionReviewsModal } from '../components/groups/SessionReviewsModal';
import { RecordingModal } from '../components/groups/RecordingModal';
import { RecordingPlayerModal } from '../components/groups/RecordingPlayerModal';
import { ReportModal, ReportTarget } from '../components/reports/ReportModal';

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
  const activeTab: GroupTab = tabParam && TABS.includes(tabParam) ? tabParam : 'docs';

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

  const { groups: myGroups, markSeen, markChatSeen, refresh: refreshMyGroups } = useMyGroups();
  const unreadMessages = myGroups.find((mine) => mine.id === numericGroupId)?.unreadMessages ?? 0;
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
  const onlineMembers = useOnlineMembers(numericGroupId, isMember && activeTab === 'members');
  const messageParam = Number(searchParams.get('message'));
  const focusMessageId = Number.isInteger(messageParam) && messageParam > 0 ? messageParam : null;
  const [joiningVoice, setJoiningVoice] = useState(false);
  const live = useGroupLive(numericGroupId, isMember);
  const inVoice = live.voice.participants.some((participant) => participant.id === user?.id);

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

  const changeTab = (tab: GroupTab) => updateParams({ tab: tab === 'docs' ? null : tab });

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
        {sessions.map((session) => (
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

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Grupos de estudio', to: '/groups' }, { label: groupName }]} />

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{groupName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {group?.description || 'Documentos y sesiones de estudio compartidos solo con los miembros del grupo.'}
          </p>
          {group?.code && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <VisibilityBadge visibility={group.visibility} />
              <span className="text-slate-500">
                Código <span className="font-mono font-semibold tracking-wider text-slate-800">{group.code}</span>
              </span>
              {group.creatorUsername && (
                <span className="text-slate-500">· Creado por @{group.creatorUsername}</span>
              )}
            </div>
          )}
        </div>

        {isMember && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Subir documento
            </button>
            <button
              type="button"
              onClick={() => void toggleVoice()}
              disabled={joiningVoice}
              title={
                live.voice.participants.length > 0
                  ? `En la sala: ${live.voice.participants.map((participant) => `@${participant.username}`).join(', ')}`
                  : 'Nadie está en la sala de voz'
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold disabled:opacity-50 ${
                inVoice
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Headphones size={15} /> {joiningVoice ? 'Abriendo...' : inVoice ? 'Salir de la sala' : 'Sala de voz'}
              {live.voice.participants.length > 0 && (
                <span className="flex -space-x-1.5">
                  {live.voice.participants.slice(0, 3).map((participant) => (
                    <span key={participant.id} className="rounded-full ring-2 ring-white">
                      <UserAvatar username={participant.username} avatarUrl={participant.avatarUrl} size={18} />
                    </span>
                  ))}
                  {live.voice.participants.length > 3 && (
                    <span className="pl-2 text-[10px]">+{live.voice.participants.length - 3}</span>
                  )}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => void toggleMuted()}
              aria-label={group?.muted ? 'Activar avisos del grupo' : 'Silenciar el grupo'}
              title={group?.muted ? 'Activar avisos del grupo' : 'Silenciar el grupo'}
              aria-pressed={Boolean(group?.muted)}
              className={`inline-flex items-center rounded-xl border px-2.5 py-2 ${
                group?.muted
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700'
              }`}
            >
              {group?.muted ? <BellOff size={15} /> : <Bell size={15} />}
            </button>
            <button
              type="button"
              onClick={() => openSessionModal(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Calendar size={15} /> Agendar sesión
            </button>
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                >
                  <Send size={15} /> Invitar
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  aria-label="Editar grupo"
                  title="Editar grupo"
                  className="inline-flex items-center rounded-xl border border-slate-200 px-2.5 py-2 text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                >
                  <Pencil size={15} />
                </button>
              </>
            )}
            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => setGroupAction('delete')}
                aria-label="Eliminar grupo"
                title="Eliminar grupo"
                className="inline-flex items-center rounded-xl border border-slate-200 px-2.5 py-2 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            )}
            {!isOwner && (
              <button
                type="button"
                onClick={() => setGroupAction('leave')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={15} /> Salir
              </button>
            )}
          </div>
        )}
      </div>

      {!isMember ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/60 p-10 text-center">
          <div className="mb-3 rounded-full bg-amber-100 p-3 text-amber-700">
            <Lock size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Contenido exclusivo para miembros</h2>
          <p className="mt-1 max-w-md text-xs text-slate-600">
            {group?.visibility === 'PRIVATE'
              ? 'Este grupo es privado: necesitas la contraseña que te compartió su creador para entrar.'
              : 'Únete para ver los apuntes del grupo y los enlaces de sus sesiones.'}
          </p>
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            <UserPlus size={16} /> {joining ? 'Uniéndote...' : 'Unirme a este grupo'}
          </button>
        </div>
      ) : (
        <>
          <StudyRoomCard
            room={live.studyRoom}
            currentUserId={user?.id}
            canManage={canManageGroup}
            onStart={live.startStudyRoom}
            onAction={live.studyRoomAction}
          />
          <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200">
            <TabButton
              active={activeTab === 'docs'}
              onClick={() => changeTab('docs')}
              icon={<FileText size={15} />}
              label={`Documentos (${documents.totalElements})`}
            />
            <TabButton
              active={activeTab === 'sessions'}
              onClick={() => changeTab('sessions')}
              icon={<Calendar size={15} />}
              label="Sesiones de estudio"
            />
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => changeTab('chat')}
              icon={<MessagesSquare size={15} />}
              label={unreadMessages > 0 && activeTab !== 'chat' ? `Chat (${unreadMessages} nuevos)` : 'Chat'}
            />
            <TabButton
              active={activeTab === 'members'}
              onClick={() => changeTab('members')}
              icon={<Users size={15} />}
              label={group ? `Integrantes (${group.memberCount})` : 'Integrantes'}
            />
          </div>

          {activeTab === 'docs' && renderDocuments()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'chat' && (
            <GroupChat
              groupId={numericGroupId}
              canManage={canManageGroup}
              members={members}
              channelId={activeChannelId}
              messageId={focusMessageId}
              onChannelChange={(channelId, messageId) =>
                updateParams({ channel: String(channelId), message: messageId ? String(messageId) : null })
              }
              onMessageShown={clearMessageParam}
              onSeen={handleChatSeen}
            />
          )}
          {activeTab === 'members' && renderMembers()}
        </>
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
