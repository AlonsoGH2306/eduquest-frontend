import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { BarChart3, Hash, Megaphone, MessagesSquare, Pin, Search, ShieldAlert, Sparkles, Timer, Trash2 } from 'lucide-react';
import { useGroupChat } from '../../hooks/useGroupChat';
import { useGroupChannels } from '../../hooks/useGroupChannels';
import { useAuth } from '../../hooks/useAuth';
import { groupService } from '../../services/groupService';
import { ChannelSettings, ChatAttachment, GroupChannel, GroupMember, GroupMessage } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';
import { ConfirmModal } from '../common/ConfirmModal';
import { uploadChatFile } from '../chat/ChatAttachButton';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatComposer } from '../chat/ChatComposer';
import { TypingIndicator } from '../chat/TypingIndicator';
import { useChatActions } from '../chat/useChatActions';
import { ChannelSidebar } from './ChannelSidebar';
import { ChannelModal } from './ChannelModal';
import { CreatePollModal } from './CreatePollModal';
import { PinsPanel, SearchPanel } from './ChatSidePanels';
import { ThreadPanel } from './ThreadPanel';
import { ModerationModal } from './ModerationModal';
import { SummaryModal } from './SummaryModal';

const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

const dayKey = (value: string) => new Date(value).toDateString();

type SidePanel = { kind: 'thread'; rootId: number } | { kind: 'pins' } | { kind: 'search' } | null;

interface GroupChatProps {
  groupId: number;
  canManage: boolean;
  members: GroupMember[];
  channelId: number | null;
  messageId: number | null;
  onChannelChange: (channelId: number, messageId?: number) => void;
  onMessageShown: () => void;
  onSeen?: () => void;
}

const headerButton =
  'inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600';

export const GroupChat: React.FC<GroupChatProps> = ({
  groupId,
  canManage,
  members,
  channelId,
  messageId,
  onChannelChange,
  onMessageShown,
  onSeen,
}) => {
  const { user, canManageUsers } = useAuth();
  const channelState = useGroupChannels(groupId, channelId);
  const { channels } = channelState;
  const activeChannel = channels.find((channel) => channel.id === channelId) ?? channels[0] ?? null;
  const chat = useGroupChat(groupId, activeChannel?.id ?? null, true);
  const { messages, loading, error, hasOlder, loadingOlder, typingNames, notifyTyping, loadOlder } = chat;
  const actions = useChatActions(chat);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [panel, setPanel] = useState<SidePanel>(null);
  const [pinsVersion, setPinsVersion] = useState(0);
  const [channelModal, setChannelModal] = useState<{ open: boolean; channel: GroupChannel | null }>({ open: false, channel: null });
  const [channelToDelete, setChannelToDelete] = useState<GroupChannel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);
  const [summaryFor, setSummaryFor] = useState<GroupChannel | null>(null);
  const { markRead } = channelState;
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const canModerate = canManage || canManageUsers;

  const mentionCandidates = useMemo(
    () => members.filter((member) => member.id !== user?.id).map((member) => member.username),
    [members, user?.id]
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [lastMessageId, loading]);

  useEffect(() => {
    stickToBottom.current = true;
    setPanel((current) => (current?.kind === 'search' ? current : null));
  }, [groupId, activeChannel?.id]);

  useEffect(() => {
    if (!loading && !error) onSeen?.();
  }, [lastMessageId, loading, error, onSeen]);

  useEffect(() => {
    if (!loading && !error && activeChannel) markRead(activeChannel.id);
  }, [lastMessageId, loading, error, activeChannel?.id, markRead]);

  const { loadAround } = chat;
  const { jumpTo } = actions;
  const handledMessage = useRef<number | null>(null);
  useEffect(() => {
    if (messageId === null || loading || error || handledMessage.current === messageId) return;
    handledMessage.current = messageId;
    stickToBottom.current = false;
    const show = () => window.setTimeout(() => jumpTo(messageId), 50);
    if (messages.some((message) => message.id === messageId)) {
      show();
      handledMessage.current = null;
      onMessageShown();
      return;
    }
    loadAround(messageId)
      .then((found) => {
        if (found) show();
        else toast('Ese mensaje ya no está en este canal.');
      })
      .catch((err) => toast.error(extractErrorMessage(err)))
      .finally(() => {
        handledMessage.current = null;
        onMessageShown();
      });
  }, [messageId, loading, error, messages, loadAround, jumpTo, onMessageShown]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  };

  const send = async (content: string, attachment?: ChatAttachment) => {
    stickToBottom.current = actions.context?.mode !== 'edit';
    await actions.send(content, attachment);
  };

  const onDropFile = async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || actions.context?.mode === 'edit') return;
    try {
      const attachment = await uploadChatFile(file);
      if (attachment) await send('', attachment);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const runSafely = (task: () => Promise<void>) => {
    task().catch((err) => toast.error(extractErrorMessage(err)));
  };

  const togglePin = (message: GroupMessage) =>
    runSafely(async () => {
      await chat.togglePin(message);
      setPinsVersion((version) => version + 1);
      toast.success(message.pinned ? 'Mensaje desfijado' : 'Mensaje fijado');
    });

  const goToMessage = (message: GroupMessage) => {
    if (message.threadRootId) {
      setPanel({ kind: 'thread', rootId: message.threadRootId });
      return;
    }
    onChannelChange(message.channelId ?? activeChannel?.id ?? 0, message.id);
  };

  const createPoll = async (question: string, options: string[]) => {
    stickToBottom.current = true;
    const created = await groupService.createPoll(groupId, { channelId: activeChannel?.id, question, options });
    chat.addMessage(created);
  };

  const saveChannel = async (settings: ChannelSettings) => {
    if (channelModal.channel) {
      await channelState.updateChannel(channelModal.channel.id, settings);
    } else {
      const created = await channelState.createChannel(settings);
      onChannelChange(created.id);
    }
  };

  const confirmDeleteChannel = async () => {
    if (!channelToDelete) return;
    setDeletingChannel(true);
    try {
      await channelState.deleteChannel(channelToDelete.id);
      if (channelToDelete.id === activeChannel?.id) {
        const next = channels.find((channel) => channel.id !== channelToDelete.id);
        if (next) onChannelChange(next.id);
      }
      toast.success(`Canal #${channelToDelete.name} eliminado`);
      setChannelToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeletingChannel(false);
    }
  };

  const togglePanel = useCallback((kind: 'pins' | 'search') => {
    setPanel((current) => (current?.kind === kind ? null : { kind }));
  }, []);

  if (channelState.loading) return <Spinner label="Cargando canales..." />;
  if (channelState.error) return <ErrorState message={channelState.error} />;

  const renderMessages = () => {
    if (loading) return <Spinner label="Cargando mensajes..." />;
    if (error) return <ErrorState message={error} />;
    if (messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
          <MessagesSquare size={32} />
          <p className="text-sm font-semibold text-slate-600">Aún no hay mensajes en #{activeChannel?.name}</p>
          <p className="text-xs">Saluda al grupo o plantea tu primera duda.</p>
        </div>
      );
    }
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
      const grouped = !newDay && previous?.authorId === message.authorId && !previous.poll && !message.poll;
      return (
        <React.Fragment key={message.id}>
          {newDay && (
            <p className="py-2 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
              {DAY.format(new Date(message.createdAt))}
            </p>
          )}
          <div
            id={`chat-message-${message.id}`}
            className={`flex gap-2 rounded-xl transition-colors ${message.mine ? 'flex-row-reverse' : ''} ${grouped ? '' : 'pt-2'}`}
          >
            <div className="w-8 shrink-0">
              {!grouped && !message.mine && (
                <Link to={`/users/${message.authorId}`} aria-label={`Ver perfil de ${message.authorUsername}`}>
                  <UserAvatar username={message.authorUsername} avatarUrl={message.authorAvatarUrl} size={32} />
                </Link>
              )}
            </div>
            <div className={`flex max-w-[80%] flex-col ${message.mine ? 'items-end' : 'items-start'}`}>
              {!grouped && !message.mine && (
                <span className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Link to={`/users/${message.authorId}`} className="hover:text-indigo-600 hover:underline">
                    @{message.authorUsername}
                  </Link>
                  {message.authorAdvisor && <AdvisorBadge compact />}
                </span>
              )}
              <MessageBubble
                message={message}
                currentUserId={user?.id}
                myUsername={user?.username}
                canDelete={message.mine || canModerate}
                canPin={canModerate}
                onReply={() => actions.reply(message, message.authorUsername)}
                onEdit={() => actions.edit(message)}
                onDelete={() => actions.setToDelete(message)}
                onJumpTo={actions.jumpTo}
                onReact={(emoji) => runSafely(() => chat.toggleReaction(message.id, emoji))}
                onOpenThread={() => setPanel({ kind: 'thread', rootId: message.id })}
                onTogglePin={() => togglePin(message)}
                onVote={chat.votePoll}
                onToggleSaved={() =>
                  runSafely(async () => {
                    await chat.toggleSaved(message);
                    toast.success(message.saved ? 'Quitado de guardados' : 'Guardado para después');
                  })
                }
              />
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs md:h-[70vh] md:flex-row">
      <ChannelSidebar
        channels={channels}
        activeId={activeChannel?.id ?? null}
        canManage={canModerate}
        onSelect={(channel) => onChannelChange(channel.id)}
        onCreate={() => setChannelModal({ open: true, channel: null })}
        onEdit={(channel) => setChannelModal({ open: true, channel })}
        onDelete={setChannelToDelete}
      />

      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDropFile}
        className="flex min-h-[28rem] min-w-0 flex-1 flex-col"
      >
        <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          {activeChannel?.readOnly ? (
            <Megaphone size={16} className="shrink-0 text-slate-400" />
          ) : (
            <Hash size={16} className="shrink-0 text-slate-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{activeChannel?.name}</p>
            {activeChannel?.topic && <p className="truncate text-[11px] text-slate-500">{activeChannel.topic}</p>}
          </div>
          {activeChannel && activeChannel.slowModeSeconds > 0 && (
            <span
              className="hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:inline-flex"
              title="Modo lento activo"
            >
              <Timer size={12} /> {activeChannel.slowModeSeconds} s
            </span>
          )}
          <button type="button" onClick={() => setSummaryFor(activeChannel)} className={headerButton} title="Resumen con IA">
            <Sparkles size={14} /> <span className="hidden lg:inline">Ponme al día</span>
          </button>
          {canModerate && (
            <button type="button" onClick={() => setModerationOpen(true)} className={headerButton} title="Moderación del chat">
              <ShieldAlert size={14} />
            </button>
          )}
          <button type="button" onClick={() => togglePanel('pins')} className={headerButton} aria-pressed={panel?.kind === 'pins'}>
            <Pin size={14} /> <span className="hidden sm:inline">Fijados</span>
          </button>
          <button type="button" onClick={() => togglePanel('search')} className={headerButton} aria-pressed={panel?.kind === 'search'}>
            <Search size={14} /> <span className="hidden sm:inline">Buscar</span>
          </button>
        </header>

        <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto px-4 py-4" aria-live="polite">
          {hasOlder && !loading && (
            <div className="mb-3 text-center">
              <button
                type="button"
                onClick={() => void loadOlder()}
                disabled={loadingOlder}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingOlder ? 'Cargando...' : 'Ver mensajes anteriores'}
              </button>
            </div>
          )}
          {renderMessages()}
        </div>

        <TypingIndicator names={typingNames} />
        {activeChannel?.readOnly && !canModerate ? (
          <p className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <Megaphone size={14} /> Canal de anuncios: solo el creador y los moderadores pueden escribir aquí.
          </p>
        ) : (
          <ChatComposer
            inputId="chat-message"
            placeholder={`Mensaje para #${activeChannel?.name ?? 'general'}`}
            context={actions.context}
            resetKey={`${groupId}:${activeChannel?.id}`}
            mentionCandidates={mentionCandidates}
            extraActions={
              <button
                type="button"
                onClick={() => setPollOpen(true)}
                aria-label="Crear encuesta"
                title="Crear encuesta"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
              >
                <BarChart3 size={16} />
              </button>
            }
            onCancelContext={() => actions.setContext(null)}
            onSend={send}
            onTyping={notifyTyping}
          />
        )}
      </section>

      {panel?.kind === 'thread' && (
        <ThreadPanel
          groupId={groupId}
          rootId={panel.rootId}
          currentUserId={user?.id}
          myUsername={user?.username}
          mentionCandidates={mentionCandidates}
          canModerate={canModerate}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.kind === 'pins' && activeChannel && (
        <PinsPanel
          groupId={groupId}
          channelId={activeChannel.id}
          refreshKey={pinsVersion}
          onSelect={goToMessage}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.kind === 'search' && activeChannel && (
        <SearchPanel groupId={groupId} channelId={activeChannel.id} onSelect={goToMessage} onClose={() => setPanel(null)} />
      )}

      <ChannelModal
        isOpen={channelModal.open}
        channel={channelModal.channel}
        onClose={() => setChannelModal({ open: false, channel: null })}
        onSave={saveChannel}
      />
      <ModerationModal groupId={groupId} isOpen={moderationOpen} onClose={() => setModerationOpen(false)} />
      <SummaryModal
        groupId={groupId}
        channelId={summaryFor?.id ?? null}
        channelName={summaryFor?.name ?? ''}
        onClose={() => setSummaryFor(null)}
      />
      <CreatePollModal isOpen={pollOpen} onClose={() => setPollOpen(false)} onCreate={createPoll} />
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
        isOpen={actions.toDelete !== null}
        title="Eliminar mensaje"
        message="Todos verán «Mensaje eliminado» en su lugar. No se puede deshacer."
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        destructive
        loading={actions.deleting}
        icon={<Trash2 size={14} />}
        onConfirm={() => void actions.confirmDelete()}
        onClose={() => actions.setToDelete(null)}
      />
    </div>
  );
};
