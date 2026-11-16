import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, LogOut, Trash2, UserPlus, Users } from 'lucide-react';
import { ChatAttachment, ChatRoom } from '../../types';
import { useRoomChat } from '../../hooks/useRoomChat';
import { roomService } from '../../services/roomService';
import { extractErrorMessage } from '../../utils/errors';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';
import { ConfirmModal } from '../common/ConfirmModal';
import { ChatRow, DaySeparator, withinGroupWindow } from '../chat/ChatRow';
import { MessageBubble } from '../chat/MessageBubble';
import { ChatComposer } from '../chat/ChatComposer';
import { useChatActions } from '../chat/useChatActions';
import { uploadChatFile } from '../chat/ChatAttachButton';
import { RoomModal } from './RoomModal';

const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

interface RoomChatProps {
  room: ChatRoom;
  myUsername?: string;
  onRead: () => void;
  onLeft: () => void;
  onChanged: () => void;
}

export const RoomChat: React.FC<RoomChatProps> = ({ room, myUsername, onRead, onLeft, onChanged }) => {
  const chat = useRoomChat(room.id);
  const { messages, loading, error, hasOlder, loadingOlder, loadOlder } = chat;
  const actions = useChatActions(chat);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [leaving, setLeaving] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const lastId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const mentionCandidates = room.members.map((member) => member.username).filter((name) => name !== myUsername);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [lastId, loading]);

  useEffect(() => {
    if (!loading && !error) onRead();
  }, [lastId, loading, error, onRead]);

  const send = async (content: string, attachment?: ChatAttachment) => {
    stickToBottom.current = actions.context?.mode !== 'edit';
    await actions.send(content, attachment);
  };

  const leave = async () => {
    setLeaving(true);
    try {
      await roomService.leaveRoom(room.id);
      toast.success('Saliste del chat');
      onLeft();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={async (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (!file || actions.context?.mode === 'edit') return;
        try {
          const attachment = await uploadChatFile(file);
          if (attachment) await send('', attachment);
        } catch (err) {
          toast.error(extractErrorMessage(err));
        }
      }}
      className="flex h-full min-h-0 flex-col"
    >
      <header className="flex h-14 shrink-0 items-center gap-3 px-4 shadow-[0_1px_0_rgb(0_0_0/0.18)]">
        <Link to="/messages" aria-label="Volver a las conversaciones" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden">
          <ArrowLeft size={18} />
        </Link>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <Users size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{room.name}</p>
          <p className="truncate text-[11px] text-slate-500">{room.members.map((member) => `@${member.username}`).join(', ')}</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label="Agregar personas o renombrar"
          title="Agregar personas o renombrar"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
        >
          <UserPlus size={16} />
        </button>
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          aria-label="Salir del chat"
          title="Salir del chat"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
        </button>
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
        <div
          ref={listRef}
          onScroll={() => {
            const list = listRef.current;
            if (list) stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
          }}
          className="flex-1 overflow-y-auto pt-2 pb-4"
          aria-live="polite"
        >
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
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">Saluda al grupo para empezar la conversación.</p>
          )}
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const newDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
            const grouped = !newDay && previous?.authorId === message.authorId && withinGroupWindow(previous.createdAt, message.createdAt);
            return (
              <React.Fragment key={message.id}>
                {newDay && <DaySeparator label={DAY.format(new Date(message.createdAt))} />}
                <ChatRow
                  id={`chat-message-${message.id}`}
                  authorId={message.authorId}
                  username={message.authorUsername}
                  avatarUrl={message.authorAvatarUrl}
                  createdAt={message.createdAt}
                  grouped={grouped}
                >
                  <MessageBubble
                    message={message}
                    myUsername={myUsername}
                    canDelete={message.mine}
                    onReply={() => actions.reply(message, message.authorUsername)}
                    onEdit={() => actions.edit(message)}
                    onDelete={() => actions.setToDelete(message)}
                    onJumpTo={actions.jumpTo}
                  />
                </ChatRow>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <ChatComposer
        inputId="room-message"
        placeholder={`Mensaje para ${room.name}`}
        context={actions.context}
        resetKey={room.id}
        mentionCandidates={mentionCandidates}
        onCancelContext={() => actions.setContext(null)}
        onSend={send}
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
      <ConfirmModal
        isOpen={confirmLeave}
        title="Salir del chat"
        message="Dejarás de recibir sus mensajes. Si eres la última persona, el chat se elimina."
        confirmLabel="Salir"
        loadingLabel="Saliendo..."
        destructive
        loading={leaving}
        icon={<LogOut size={14} />}
        onConfirm={() => void leave()}
        onClose={() => setConfirmLeave(false)}
      />
      <RoomModal isOpen={addOpen} room={room} onClose={() => setAddOpen(false)} onSaved={onChanged} />
    </section>
  );
};
