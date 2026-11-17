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

const actionClass = 'rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800';

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
    <div className="group relative">
      <div
        className="flex min-w-0 flex-col items-start"
        onDoubleClick={onReact && !deleted ? () => onReact(QUICK_REACTION) : undefined}
        title={onReact && !deleted ? 'Doble clic para reaccionar con 👍' : undefined}
      >
        {message.pinned && !deleted && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
            <Pin size={11} /> Fijado
          </span>
        )}
        {message.replyTo && !deleted && (
          <button
            type="button"
            onClick={() => onJumpTo?.(message.replyTo!.id)}
            className={`mb-0.5 flex max-w-full items-center gap-1.5 truncate text-left text-[13px] text-slate-500 hover:text-slate-800 ${
              message.replyTo.deleted ? 'italic' : ''
            }`}
          >
            <CornerUpLeft size={13} className="shrink-0 -scale-x-100" />
            <span className="font-semibold text-slate-700">@{message.replyTo.authorUsername}</span>
            <span className="truncate">{message.replyTo.preview}</span>
          </button>
        )}
        {deleted ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-slate-400 italic">
            <Ban size={13} /> {DELETED_LABEL}
          </p>
        ) : (
          <div className="flex max-w-full flex-col items-start gap-1.5">
            {message.content && (
              <div className="text-[15px] leading-relaxed break-words text-slate-800">
                <RichText content={message.content} myUsername={myUsername} />
                {message.editedAt && <span className="ml-1 text-[11px] text-slate-400">(editado)</span>}
              </div>
            )}
            {message.sticker && <StickerView value={message.sticker} />}
            {message.imageUrl && <ChatImage url={message.imageUrl} mine={false} />}
            {message.fileUrl && <FileAttachment url={message.fileUrl} name={message.fileName ?? 'Archivo'} mine={false} />}
            {message.poll && onVote && <PollCard poll={message.poll} currentUserId={currentUserId} onVote={onVote} />}
          </div>
        )}
        {!deleted && onReact && (
          <ReactionBar reactions={message.reactions ?? []} currentUserId={currentUserId} mine={false} onToggle={onReact} />
        )}
        {!deleted && onOpenThread && threadCount > 0 && (
          <button
            type="button"
            onClick={onOpenThread}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:underline"
          >
            <MessageSquareText size={13} /> {threadCount === 1 ? '1 respuesta en el hilo' : `${threadCount} respuestas en el hilo`}
          </button>
        )}
      </div>
      {!deleted && (
        <div className="absolute -top-5 right-0 z-10 flex items-center rounded-md border border-slate-200 bg-white p-0.5 opacity-0 shadow-md transition group-hover/row:opacity-100 focus-within:opacity-100">
          {onReact && <EmojiPicker onPick={onReact} align="right" className={actionClass} />}
          {onReply && (
            <button type="button" onClick={onReply} className={actionClass} aria-label="Responder" title="Responder">
              <CornerUpLeft size={16} />
            </button>
          )}
          {onOpenThread && (
            <button type="button" onClick={onOpenThread} className={actionClass} aria-label="Abrir hilo" title="Responder en hilo">
              <MessageSquareText size={16} />
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
              {message.saved ? <BookmarkCheck size={16} className="text-indigo-600" /> : <Bookmark size={16} />}
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
              {message.pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
          )}
          {mine && message.content && onEdit && (
            <button type="button" onClick={onEdit} className={actionClass} aria-label="Editar mensaje" title="Editar">
              <Pencil size={16} />
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
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
