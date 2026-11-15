import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MessagesSquare, Send } from 'lucide-react';
import { useGroupChat } from '../../hooks/useGroupChat';
import { extractErrorMessage } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';

const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const MAX_LENGTH = 1000;

const dayKey = (value: string) => new Date(value).toDateString();

interface GroupChatProps {
  groupId: number;
  onSeen?: () => void;
}

export const GroupChat: React.FC<GroupChatProps> = ({ groupId, onSeen }) => {
  const { messages, loading, error, hasOlder, loadingOlder, sendMessage, loadOlder } = useGroupChat(groupId, true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [lastMessageId, loading]);

  useEffect(() => {
    stickToBottom.current = true;
  }, [groupId]);

  useEffect(() => {
    if (!loading && !error) onSeen?.();
  }, [lastMessageId, loading, error, onSeen]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      stickToBottom.current = true;
      await sendMessage(content);
      setDraft('');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner label="Cargando mensajes..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="flex h-[60vh] min-h-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
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
            <MessagesSquare size={32} />
            <p className="text-sm font-semibold text-slate-600">Aún no hay mensajes</p>
            <p className="text-xs">Saluda al grupo o plantea tu primera duda.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const newDay = !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt);
            const grouped = !newDay && previous?.authorId === message.authorId;
            return (
              <React.Fragment key={message.id}>
                {newDay && (
                  <p className="py-2 text-center text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                    {DAY.format(new Date(message.createdAt))}
                  </p>
                )}
                <div className={`flex gap-2 ${message.mine ? 'flex-row-reverse' : ''} ${grouped ? '' : 'pt-2'}`}>
                  <div className="w-8 shrink-0">
                    {!grouped && !message.mine && (
                      <UserAvatar username={message.authorUsername} avatarUrl={message.authorAvatarUrl} size={32} />
                    )}
                  </div>
                  <div className={`flex max-w-[75%] flex-col ${message.mine ? 'items-end' : 'items-start'}`}>
                    {!grouped && !message.mine && (
                      <span className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        @{message.authorUsername}
                        {message.authorAdvisor && <AdvisorBadge compact />}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap ${
                        message.mine ? 'rounded-tr-md bg-indigo-600 text-white' : 'rounded-tl-md bg-slate-100 text-slate-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className="mt-0.5 text-[10px] text-slate-400">{TIME.format(new Date(message.createdAt))}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-100 p-3">
        <label htmlFor="chat-message" className="sr-only">
          Escribe un mensaje
        </label>
        <textarea
          id="chat-message"
          rows={1}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para salto de línea)"
          className="max-h-32 flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Enviar mensaje"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
