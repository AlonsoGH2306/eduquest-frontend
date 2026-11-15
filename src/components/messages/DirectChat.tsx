import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { UserSummary } from '../../types';
import { useDirectChat } from '../../hooks/useDirectChat';
import { extractErrorMessage } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';

const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const MAX_LENGTH = 1000;

const dayKey = (value: string) => new Date(value).toDateString();

interface DirectChatProps {
  partner: UserSummary;
  onIncoming: () => void;
  onSent: () => void;
}

export const DirectChat: React.FC<DirectChatProps> = ({ partner, onIncoming, onSent }) => {
  const { messages, loading, error, hasOlder, loadingOlder, sendMessage, loadOlder } = useDirectChat(partner.id);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastIncomingId = [...messages].reverse().find((message) => !message.mine)?.id ?? null;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [lastMessage?.id, loading]);

  useEffect(() => {
    stickToBottom.current = true;
    setDraft('');
    inputRef.current?.focus();
  }, [partner.id]);

  useEffect(() => {
    if (!loading && !error) onIncoming();
  }, [lastIncomingId, loading, error, onIncoming]);

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
      onSent();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Link
          to="/messages"
          aria-label="Volver a las conversaciones"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <ArrowLeft size={18} />
        </Link>
        <UserAvatar username={partner.username} avatarUrl={partner.avatarUrl} size={36} />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900">
            @{partner.username}
            {partner.advisor && <AdvisorBadge compact />}
          </p>
          <p className="text-[11px] text-slate-500">Conversación privada</p>
        </div>
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
                  <div className={`flex ${message.mine ? 'justify-end' : 'justify-start'} ${grouped ? '' : 'pt-2'}`}>
                    <div className={`flex max-w-[75%] flex-col ${message.mine ? 'items-end' : 'items-start'}`}>
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
      )}

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-slate-100 p-3">
        <label htmlFor="direct-message" className="sr-only">
          Escribe un mensaje
        </label>
        <textarea
          id="direct-message"
          ref={inputRef}
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
          placeholder={`Mensaje para @${partner.username}`}
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
    </section>
  );
};
