import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
import { ChatAttachment, UserStatus, UserSummary } from '../../types';
import { personalService } from '../../services/personalService';
import { availabilityDot, availabilityLabel } from '../../utils/availability';
import { useDirectChat } from '../../hooks/useDirectChat';
import { useAuth } from '../../hooks/useAuth';
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

const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

const dayKey = (value: string) => new Date(value).toDateString();

interface DirectChatProps {
  partner: UserSummary;
  onIncoming: () => void;
  onSent: () => void;
}

export const DirectChat: React.FC<DirectChatProps> = ({ partner, onIncoming, onSent }) => {
  const { user } = useAuth();
  const chat = useDirectChat(partner.id);
  const { messages, loading, error, hasOlder, loadingOlder, typingNames, notifyTyping, loadOlder } = chat;
  const actions = useChatActions(chat);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastIncomingId = [...messages].reverse().find((message) => !message.mine)?.id ?? null;
  const { setContext } = actions;
  const [status, setStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus(null);
    personalService
      .getStatuses([partner.id], controller.signal)
      .then((statuses) => setStatus(statuses[0] ?? null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [partner.id]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [lastMessage?.id, loading]);

  useEffect(() => {
    stickToBottom.current = true;
    setContext(null);
  }, [partner.id, setContext]);

  useEffect(() => {
    if (!loading && !error) onIncoming();
  }, [lastIncomingId, loading, error, onIncoming]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  };

  const send = async (content: string, attachment?: ChatAttachment) => {
    const editing = actions.context?.mode === 'edit';
    stickToBottom.current = !editing;
    await actions.send(content, attachment);
    if (!editing) onSent();
  };

  const onDropImage = async (event: React.DragEvent<HTMLElement>) => {
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

  return (
    <section onDragOver={(event) => event.preventDefault()} onDrop={onDropImage} className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link
          to="/messages"
          aria-label="Volver a las conversaciones"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <ArrowLeft size={18} />
        </Link>
        <Link to={`/users/${partner.id}`} className="flex min-w-0 items-center gap-3" title="Ver perfil">
          <UserAvatar username={partner.username} avatarUrl={partner.avatarUrl} size={36} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900">
              @{partner.username}
              {partner.advisor && <AdvisorBadge compact />}
            </p>
            <p className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
              {typingNames.length > 0 ? (
                'Escribiendo…'
              ) : status ? (
                <>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${availabilityDot(status.availability, status.online)}`} />
                  {status.statusText
                    ? `${status.statusEmoji ?? ''} ${status.statusText}`.trim()
                    : status.online
                      ? availabilityLabel(status.availability)
                      : 'Desconectado'}
                </>
              ) : (
                'Conversación privada'
              )}
            </p>
          </div>
        </Link>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner label="Cargando mensajes..." />
        </div>
      ) : error ? (
        <div className="flex-1 p-4">
          <ErrorState message={error} />
        </div>
      ) : (
        <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto px-4 py-4" aria-live="polite">
          {hasOlder && (
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

          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
              <MessageCircle size={32} />
              <p className="text-sm font-semibold text-slate-600">Empieza la conversación</p>
              <p className="text-xs">Escríbele a @{partner.username} para coordinar, resolver dudas o compartir material.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const previous = messages[index - 1];
              const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
              const grouped = !newDay && previous?.mine === message.mine;
              return (
                <React.Fragment key={message.id}>
                  {newDay && (
                    <p className="py-2 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                      {DAY.format(new Date(message.createdAt))}
                    </p>
                  )}
                  <div
                    id={`chat-message-${message.id}`}
                    className={`flex rounded-xl transition-colors ${message.mine ? 'justify-end' : 'justify-start'} ${grouped ? '' : 'pt-2'}`}
                  >
                    <div className="max-w-[80%]">
                      <MessageBubble
                        message={message}
                        canDelete={message.mine}
                        onReply={() => actions.reply(message, message.mine ? (user?.username ?? '') : partner.username)}
                        onEdit={() => actions.edit(message)}
                        onDelete={() => actions.setToDelete(message)}
                        onJumpTo={actions.jumpTo}
                        myUsername={user?.username}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      )}

      <TypingIndicator names={typingNames} />
      <ChatComposer
        inputId="direct-message"
        placeholder={`Mensaje para @${partner.username}`}
        context={actions.context}
        resetKey={partner.id}
        onCancelContext={() => actions.setContext(null)}
        onSend={send}
        onTyping={notifyTyping}
      />

      <ConfirmModal
        isOpen={actions.toDelete !== null}
        title="Eliminar mensaje"
        message="Se mostrará «Mensaje eliminado» en la conversación. No se puede deshacer."
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        destructive
        loading={actions.deleting}
        icon={<Trash2 size={14} />}
        onConfirm={() => void actions.confirmDelete()}
        onClose={() => actions.setToDelete(null)}
      />
    </section>
  );
};
