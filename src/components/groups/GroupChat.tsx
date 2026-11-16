import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Hash, Megaphone, Pin, Search, ShieldAlert, Sparkles, Timer, Trash2 } from 'lucide-react';
import { useGroupChat } from '../../hooks/useGroupChat';
import { useAuth } from '../../hooks/useAuth';
import { groupService } from '../../services/groupService';
import { ChatAttachment, GroupChannel, GroupMember, GroupMessage } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';
import { ConfirmModal } from '../common/ConfirmModal';
import { uploadChatFile } from '../chat/ChatAttachButton';
import { ChatRow, DaySeparator, withinGroupWindow } from '../chat/ChatRow';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatComposer } from '../chat/ChatComposer';
import { TypingIndicator } from '../chat/TypingIndicator';
import { useChatActions } from '../chat/useChatActions';
import { Lumi } from '../brand/Lumi';
import { CreatePollModal } from './CreatePollModal';
import { PinsPanel, SearchPanel } from './ChatSidePanels';
import { ThreadPanel } from './ThreadPanel';
import { ModerationModal } from './ModerationModal';
import { SummaryModal } from './SummaryModal';

const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

const dayKey = (value: string) => new Date(value).toDateString();

type SidePanel = { kind: 'thread'; rootId: number } | { kind: 'pins' } | { kind: 'search' } | null;

interface GroupChatProps {
  groupId: number;
  canManage: boolean;
  members: GroupMember[];
  channels: GroupChannel[];
  channelsLoading: boolean;
  channelsError: string | null;
  markRead: (channelId: number) => void;
  channelId: number | null;
  messageId: number | null;
  onChannelChange: (channelId: number, messageId?: number) => void;
  onMessageShown: () => void;
  onSeen?: () => void;
}

const headerButton =
  'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900';

export const GroupChat: React.FC<GroupChatProps> = ({
  groupId,
  canManage,
  members,
  channels,
  channelsLoading,
  channelsError,
  markRead,
  channelId,
  messageId,
  onChannelChange,
  onMessageShown,
  onSeen,
}) => {
  const { user, canManageUsers } = useAuth();
  const activeChannel = channels.find((channel) => channel.id === channelId) ?? channels[0] ?? null;
  const chat = useGroupChat(groupId, activeChannel?.id ?? null, true);
  const { messages, loading, error, hasOlder, loadingOlder, typingNames, notifyTyping, loadOlder } = chat;
  const actions = useChatActions(chat);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [panel, setPanel] = useState<SidePanel>(null);
  const [pinsVersion, setPinsVersion] = useState(0);
  const [pollOpen, setPollOpen] = useState(false);
  const [moderationOpen, setModerationOpen] = useState(false);
  const [summaryFor, setSummaryFor] = useState<GroupChannel | null>(null);
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const [newSince, setNewSince] = useState<{ channelId: number; count: number } | null>(null);
  const activeChannelId = activeChannel?.id ?? null;
  const activeUnread = activeChannel?.unreadCount ?? 0;

  useEffect(() => {
    if (activeChannelId === null) return;
    setNewSince((current) =>
      current?.channelId === activeChannelId ? current : { channelId: activeChannelId, count: activeUnread }
    );
  }, [activeChannelId, activeUnread]);

  const newCount = newSince?.channelId === activeChannelId ? newSince.count : 0;
  const firstNew = newCount > 0 && messages.length >= newCount ? messages[messages.length - newCount] : null;
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
  }, [groupId, activeChannelId]);

  useEffect(() => {
    if (!loading && !error) onSeen?.();
  }, [lastMessageId, loading, error, onSeen]);

  useEffect(() => {
    if (!loading && !error && activeChannelId !== null) markRead(activeChannelId);
  }, [lastMessageId, loading, error, activeChannelId, markRead]);

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

  const togglePanel = useCallback((kind: 'pins' | 'search') => {
    setPanel((current) => (current?.kind === kind ? null : { kind }));
  }, []);

  if (channelsLoading) return <Spinner label="Cargando canales..." />;
  if (channelsError) return <ErrorState message={channelsError} />;

  const renderMessages = () => {
    if (loading) return <Spinner label="Cargando mensajes..." />;
    if (error) return <ErrorState message={error} />;
    if (messages.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
          <Lumi mood="sleepy" size={96} animated={false} />
          <p className="text-base font-semibold text-slate-700">Aquí está muy oscuro todavía</p>
          <p className="text-sm">¿Quién enciende la primera luz en #{activeChannel?.name}?</p>
        </div>
      );
    }
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
      const grouped =
        !newDay &&
        previous?.authorId === message.authorId &&
        !previous.poll &&
        !message.poll &&
        withinGroupWindow(previous.createdAt, message.createdAt);
      return (
        <React.Fragment key={message.id}>
          {newDay && <DaySeparator label={DAY.format(new Date(message.createdAt))} />}
          <ChatRow
            id={`chat-message-${message.id}`}
            authorId={message.authorId}
            username={message.authorUsername}
            avatarUrl={message.authorAvatarUrl}
            advisor={message.authorAdvisor}
            createdAt={message.createdAt}
            grouped={grouped}
          >
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
          </ChatRow>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-1 bg-canvas">
      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDropFile}
        className="flex min-h-0 min-w-0 flex-1 flex-col"
      >
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 shadow-[0_1px_0_rgb(0_0_0/0.18)]">
          {activeChannel?.readOnly ? (
            <Megaphone size={16} className="shrink-0 text-slate-400" />
          ) : (
            <Hash size={16} className="shrink-0 text-slate-400" />
          )}
          <p className="flex min-w-0 flex-1 items-baseline gap-3 truncate">
            <span className="text-[15px] font-bold text-slate-900">{activeChannel?.name}</span>
            {activeChannel?.topic && <span className="hidden truncate text-sm text-slate-500 sm:inline">{activeChannel.topic}</span>}
          </p>
          {activeChannel && activeChannel.slowModeSeconds > 0 && (
            <span
              className="hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 sm:inline-flex"
              title="Modo lento activo"
            >
              <Timer size={12} /> {activeChannel.slowModeSeconds} s
            </span>
          )}
          <button
            type="button"
            onClick={() => setSummaryFor(activeChannel)}
            title="Resumen con IA de lo que te perdiste"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-raised px-3 text-xs font-bold text-lumi-ink transition hover:brightness-110"
          >
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

        {newCount > 0 && !loading && (
          <div className="mx-4 mt-3 flex items-center gap-3 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            <button
              type="button"
              onClick={() => firstNew && jumpTo(firstNew.id)}
              className="min-w-0 flex-1 truncate text-left hover:underline"
            >
              {newCount === 1 ? '1 mensaje nuevo' : `${newCount > 99 ? 'Más de 99' : newCount} mensajes nuevos`}
              {firstNew ? ` desde las ${TIME.format(new Date(firstNew.createdAt))}` : ''}
            </button>
            <button
              type="button"
              onClick={() => setNewSince({ channelId: activeChannelId ?? 0, count: 0 })}
              className="shrink-0 font-bold hover:underline"
            >
              Marcar como leído
            </button>
          </div>
        )}
        <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto pt-2 pb-4" aria-live="polite">
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
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

      <ModerationModal groupId={groupId} isOpen={moderationOpen} onClose={() => setModerationOpen(false)} />
      <SummaryModal
        groupId={groupId}
        channelId={summaryFor?.id ?? null}
        channelName={summaryFor?.name ?? ''}
        onClose={() => setSummaryFor(null)}
      />
      <CreatePollModal isOpen={pollOpen} onClose={() => setPollOpen(false)} onCreate={createPoll} />
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
