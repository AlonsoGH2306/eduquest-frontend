import React from 'react';
import { Ban, Bookmark, BookmarkCheck, CornerUpLeft, MessageSquareText, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { ChatReply, MessageReaction, Poll } from '../../types';
import { ChatImage } from '../common/ChatImageButton';
import { DELETED_LABEL } from '../../utils/chatMessages';
import { RichText } from './RichText';
import { StickerView } from './StickerView';
import { FileAttachment } from './FileAttachment';
import { ReactionBar } from './ReactionBar';
import { EmojiPicker } from './EmojiPicker';
import { PollCard } from './PollCard';

const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

export interface BubbleMessage {
  id: number;
  content: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  sticker?: string | null;
  mine: boolean;
  createdAt: string;
  editedAt?: string | null;
  deleted?: boolean;
  replyTo?: ChatReply | null;
  pinned?: boolean;
  reactions?: MessageReaction[];
  threadReplyCount?: number;
  poll?: Poll | null;
  saved?: boolean;
}

export const QUICK_REACTION = '👍';

interface MessageBubbleProps {
  message: BubbleMessage;
  canDelete: boolean;
  currentUserId?: number;
  myUsername?: string;
  canPin?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onJumpTo?: (messageId: number) => void;
  onReact?: (emoji: string) => void;
  onOpenThread?: () => void;
  onTogglePin?: () => void;
  onVote?: (pollId: number, optionId: number | null) => Promise<void>;
  onToggleSaved?: () => void;
}

const actionClass = 'rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  canDelete,
  currentUserId,
  myUsername,
  canPin,
  onReply,
  onEdit,
  onDelete,
  onJumpTo,
  onReact,
  onOpenThread,
  onTogglePin,
  onVote,
  onToggleSaved,
}) => {
  const { mine, deleted } = message;
  const threadCount = message.threadReplyCount ?? 0;

  return (
    <div className={`group flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex min-w-0 flex-col ${mine ? 'items-end' : 'items-start'}`}
        onDoubleClick={onReact && !deleted ? () => onReact(QUICK_REACTION) : undefined}
        title={onReact && !deleted ? 'Doble clic para reaccionar con 👍' : undefined}
      >
        {message.pinned && !deleted && (
          <span className="mb-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
            <Pin size={10} /> Fijado
          </span>
        )}
        {message.replyTo && !deleted && (
          <button
            type="button"
            onClick={() => onJumpTo?.(message.replyTo!.id)}
            className={`mb-0.5 max-w-full truncate rounded-lg border-l-2 border-indigo-400 bg-slate-50 px-2 py-1 text-left text-[11px] text-slate-500 hover:bg-slate-100 ${
              message.replyTo.deleted ? 'italic' : ''
            }`}
          >
            <span className="font-semibold text-slate-700">@{message.replyTo.authorUsername}</span> {message.replyTo.preview}
          </button>
        )}
        {deleted ? (
          <div className="inline-flex items-center gap-1.5 rounded-2xl border border-dashed border-slate-200 px-3 py-1.5 text-xs text-slate-400 italic">
            <Ban size={12} /> {DELETED_LABEL}
          </div>
        ) : (
          <div className={`flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
            {message.sticker && <StickerView value={message.sticker} />}
            {message.imageUrl && <ChatImage url={message.imageUrl} mine={mine} />}
            {message.fileUrl && <FileAttachment url={message.fileUrl} name={message.fileName ?? 'Archivo'} mine={mine} />}
            {message.poll && onVote && <PollCard poll={message.poll} currentUserId={currentUserId} onVote={onVote} />}
            {message.content && (
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm break-words ${
                  mine ? 'rounded-tr-md bg-indigo-600 text-white' : 'rounded-tl-md bg-slate-100 text-slate-800'
                }`}
              >
                <RichText content={message.content} inverted={mine} myUsername={myUsername} />
              </div>
            )}
          </div>
        )}
        {!deleted && onReact && (
          <ReactionBar reactions={message.reactions ?? []} currentUserId={currentUserId} mine={mine} onToggle={onReact} />
        )}
        {!deleted && onOpenThread && threadCount > 0 && (
          <button
            type="button"
            onClick={onOpenThread}
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            <MessageSquareText size={12} /> {threadCount === 1 ? '1 respuesta en el hilo' : `${threadCount} respuestas en el hilo`}
          </button>
        )}
        <span className="mt-0.5 text-[10px] text-slate-400">
          {TIME.format(new Date(message.createdAt))}
          {message.editedAt && !deleted && ' · editado'}
        </span>
      </div>
      {!deleted && (
        <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          {onReact && <EmojiPicker onPick={onReact} align={mine ? 'right' : 'left'} className={actionClass} />}
          {onReply && (
            <button type="button" onClick={onReply} className={actionClass} aria-label="Responder" title="Responder">
              <CornerUpLeft size={14} />
            </button>
          )}
          {onOpenThread && (
            <button type="button" onClick={onOpenThread} className={actionClass} aria-label="Abrir hilo" title="Responder en hilo">
              <MessageSquareText size={14} />
            </button>
          )}
          {onToggleSaved && (
            <button
              type="button"
              onClick={onToggleSaved}
              className={actionClass}
              aria-label={message.saved ? 'Quitar de guardados' : 'Guardar mensaje'}
              title={message.saved ? 'Quitar de guardados' : 'Guardar para después'}
            >
              {message.saved ? <BookmarkCheck size={14} className="text-indigo-600" /> : <Bookmark size={14} />}
            </button>
          )}
          {canPin && onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              className={actionClass}
              aria-label={message.pinned ? 'Desfijar mensaje' : 'Fijar mensaje'}
              title={message.pinned ? 'Desfijar' : 'Fijar'}
            >
              {message.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
          )}
          {mine && message.content && onEdit && (
            <button type="button" onClick={onEdit} className={actionClass} aria-label="Editar mensaje" title="Editar">
              <Pencil size={14} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className={`${actionClass} hover:text-red-600`}
              aria-label="Eliminar mensaje"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
