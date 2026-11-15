import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, Search, X } from 'lucide-react';
import { UserSummary } from '../types';
import { messageService } from '../services/messageService';
import { useConversations } from '../hooks/useConversations';
import { useDebounce } from '../hooks/useDebounce';
import { useNotifications } from '../hooks/useNotifications';
import { timeAgo } from '../utils/relativeTime';
import { extractErrorMessage, isCanceledError } from '../utils/errors';
import { UserAvatar } from '../components/common/UserAvatar';
import { AdvisorBadge } from '../components/common/AdvisorBadge';
import { UnreadBadge } from '../components/common/UnreadBadge';
import { Spinner } from '../components/common/Spinner';
import { ErrorState } from '../components/common/ErrorState';
import { DirectChat } from '../components/messages/DirectChat';

export const MessagesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const partnerId = userId ? Number(userId) : null;
  const navigate = useNavigate();
  const { conversations, loading, error, reload, clearUnread } = useConversations();
  const { refresh: refreshCounters } = useNotifications();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const [results, setResults] = useState<UserSummary[]>([]);
  const [searching, setSearching] = useState(false);

  const [partner, setPartner] = useState<UserSummary | null>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedSearch.replace(/^@/, '').length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    messageService
      .searchUsers(debouncedSearch, controller.signal)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => {
        if (!controller.signal.aborted) setSearching(false);
      });
    return () => controller.abort();
  }, [debouncedSearch]);

  const knownPartner = conversations.find((conversation) => conversation.partner.id === partnerId)?.partner ?? null;

  useEffect(() => {
    if (partnerId === null || Number.isNaN(partnerId)) {
      setPartner(null);
      return;
    }
    if (knownPartner) {
      setPartner(knownPartner);
      return;
    }
    const controller = new AbortController();
    setPartner(null);
    setPartnerError(null);
    messageService
      .getUser(partnerId, controller.signal)
      .then(setPartner)
      .catch((err) => {
        if (!isCanceledError(err)) setPartnerError(extractErrorMessage(err));
      });
    return () => controller.abort();
  }, [partnerId, knownPartner]);

  const handleIncoming = useCallback(() => {
    if (partnerId === null) return;
    clearUnread(partnerId);
    messageService
      .markRead(partnerId)
      .then(refreshCounters)
      .catch(() => undefined);
  }, [partnerId, clearUnread, refreshCounters]);

  const openChat = (user: UserSummary) => {
    setSearch('');
    setResults([]);
    navigate(`/messages/${user.id}`);
  };

  const showingSearch = debouncedSearch.replace(/^@/, '').length >= 2;

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs md:h-[calc(100vh-9rem)]">
      <aside
        className={`w-full shrink-0 flex-col border-r border-slate-100 md:flex md:w-80 ${partnerId !== null ? 'hidden' : 'flex'}`}
      >
        <div className="border-b border-slate-100 p-4">
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MessageCircle size={20} className="text-indigo-600" /> Mensajes
          </h1>
          <div className="relative mt-3">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <label htmlFor="people-search" className="sr-only">
              Buscar personas
            </label>
            <input
              id="people-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por @usuario"
              autoComplete="off"
              className="w-full rounded-xl border border-slate-300 py-2 pr-9 pl-9 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showingSearch ? (
            searching ? (
              <Spinner label="Buscando..." />
            ) : results.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">No encontramos a nadie con ese usuario.</p>
            ) : (
              <ul>
                {results.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => openChat(user)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={36} />
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        @{user.username}
                        {user.advisor && <AdvisorBadge compact />}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : loading ? (
            <Spinner label="Cargando conversaciones..." />
          ) : error ? (
            <div className="p-4">
              <ErrorState message={error} onRetry={reload} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-400">
              <MessageCircle size={30} />
              <p className="text-sm font-semibold text-slate-600">Aún no tienes conversaciones</p>
              <p className="text-xs">Busca a alguien por su usuario o escríbele desde la lista de integrantes de un grupo.</p>
            </div>
          ) : (
            <ul>
              {conversations.map((conversation) => {
                const active = conversation.partner.id === partnerId;
                return (
                  <li key={conversation.partner.id}>
                    <Link
                      to={`/messages/${conversation.partner.id}`}
                      className={`flex items-center gap-3 px-4 py-3 transition ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                      <UserAvatar
                        username={conversation.partner.username}
                        avatarUrl={conversation.partner.avatarUrl}
                        size={40}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">
                            @{conversation.partner.username}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(conversation.lastMessageAt)}</span>
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-xs ${
                              conversation.unreadCount > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'
                            }`}
                          >
                            {conversation.lastMessageMine && 'Tú: '}
                            {conversation.lastMessage}
                          </span>
                          <UnreadBadge count={conversation.unreadCount} label={`${conversation.unreadCount} sin leer`} />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <div className={`min-w-0 flex-1 ${partnerId === null ? 'hidden md:flex' : 'flex'} flex-col`}>
        {partnerId === null ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
            <MessageCircle size={40} />
            <p className="text-sm font-semibold text-slate-600">Elige una conversación</p>
            <p className="max-w-xs text-xs">Los mensajes nuevos también te llegan a la campana de notificaciones.</p>
          </div>
        ) : partnerError ? (
          <div className="p-6">
            <ErrorState message={partnerError} />
          </div>
        ) : partner ? (
          <DirectChat partner={partner} onIncoming={handleIncoming} onSent={reload} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};
