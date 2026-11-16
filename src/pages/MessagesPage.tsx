import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MessageCircle, Pin, PinOff, Plus, Search, Users, X } from 'lucide-react';
import { ChatRoom, Conversation, UserSummary } from '../types';
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
import { RoomChat } from '../components/messages/RoomChat';
import { RoomModal } from '../components/messages/RoomModal';
import { useRooms } from '../hooks/useRooms';
import { usePinnedChats } from '../hooks/usePinnedChats';
import { useAuth } from '../hooks/useAuth';
import { roomService } from '../services/roomService';
import { Lumi } from '../components/brand/Lumi';
import { UserPanel } from '../components/layout/UserPanel';

type ChatEntry =
  | { kind: 'DIRECT'; id: number; at: string; conversation: Conversation }
  | { kind: 'ROOM'; id: number; at: string; room: ChatRoom };

export const MessagesPage: React.FC = () => {
  const { userId, roomId: roomParam } = useParams<{ userId: string; roomId: string }>();
  const partnerId = userId ? Number(userId) : null;
  const roomId = roomParam ? Number(roomParam) : null;
  const chatOpen = partnerId !== null || roomId !== null;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, error, reload, clearUnread } = useConversations();
  const { rooms, reload: reloadRooms, clearUnread: clearRoomUnread } = useRooms();
  const { isPinned, togglePin } = usePinnedChats();
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const activeRoom = rooms.find((room) => room.id === roomId) ?? null;

  const entries: ChatEntry[] = [
    ...conversations.map((conversation) => ({
      kind: 'DIRECT' as const,
      id: conversation.partner.id,
      at: conversation.lastMessageAt,
      conversation,
    })),
    ...rooms.map((room) => ({ kind: 'ROOM' as const, id: room.id, at: room.lastActivityAt, room })),
  ].sort((a, b) => {
    const pinDiff = Number(isPinned(b.kind, b.id)) - Number(isPinned(a.kind, a.id));
    return pinDiff !== 0 ? pinDiff : new Date(b.at).getTime() - new Date(a.at).getTime();
  });

  const handleRoomRead = useCallback(() => {
    if (roomId === null) return;
    clearRoomUnread(roomId);
    roomService
      .markRead(roomId)
      .then(refreshCountersRef.current)
      .catch(() => undefined);
  }, [roomId, clearRoomUnread]);
  const { refresh: refreshCounters } = useNotifications();
  const refreshCountersRef = React.useRef(refreshCounters);
  refreshCountersRef.current = refreshCounters;

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
    <div className="flex h-full min-h-0 bg-canvas">
      <h1 className="sr-only">Mensajes</h1>
      <aside
        className={`w-full shrink-0 flex-col bg-side md:flex md:w-72 ${chatOpen ? 'hidden' : 'flex'}`}
      >
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
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
              className="h-9 w-full rounded-lg bg-canvas pr-9 pl-9 text-sm text-ink placeholder:text-faint focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden"
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

        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <h2 className="text-xs font-bold text-faint">Mensajes directos</h2>
          <button
            type="button"
            onClick={() => setRoomModalOpen(true)}
            aria-label="Crear chat grupal"
            title="Crear chat grupal"
            className="flex h-6 w-6 items-center justify-center rounded-md text-faint hover:bg-hover hover:text-ink"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="eq-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2">
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
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-hover"
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
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-400">
              <MessageCircle size={30} />
              <p className="text-sm font-semibold text-slate-600">Aún no tienes conversaciones</p>
              <p className="text-xs">Busca a alguien por su usuario o crea un chat grupal.</p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {entries.map((entry) => {
                const pinned = isPinned(entry.kind, entry.id);
                const active = entry.kind === 'DIRECT' ? entry.id === partnerId : entry.id === roomId;
                const unread = entry.kind === 'DIRECT' ? entry.conversation.unreadCount : entry.room.unreadCount;
                const title = entry.kind === 'DIRECT' ? `@${entry.conversation.partner.username}` : entry.room.name;
                const preview =
                  entry.kind === 'DIRECT'
                    ? `${entry.conversation.lastMessageMine ? 'Tú: ' : ''}${entry.conversation.lastMessage}`
                    : (entry.room.lastMessage ?? `${entry.room.members.length} personas`);
                return (
                  <li key={`${entry.kind}-${entry.id}`} className="group relative">
                    <Link
                      to={entry.kind === 'DIRECT' ? `/messages/${entry.id}` : `/messages/rooms/${entry.id}`}
                      className={`flex items-center gap-3 rounded-lg px-2 py-2 pr-9 transition ${active ? 'bg-selected' : 'hover:bg-hover'}`}
                    >
                      {entry.kind === 'DIRECT' ? (
                        <UserAvatar
                          username={entry.conversation.partner.username}
                          avatarUrl={entry.conversation.partner.avatarUrl}
                          size={40}
                        />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-celeste text-noche">
                          <Users size={18} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold text-slate-900">
                            {pinned && <Pin size={11} className="shrink-0 text-indigo-500" />}
                            <span className="truncate">{title}</span>
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(entry.at)}</span>
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-xs ${unread > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                            {preview}
                          </span>
                          <UnreadBadge count={unread} label={`${unread} sin leer`} />
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => void togglePin(entry.kind, entry.id)}
                      aria-label={pinned ? `Desfijar ${title}` : `Fijar ${title}`}
                      title={pinned ? 'Desfijar' : 'Fijar arriba'}
                      className="absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-md p-1 text-slate-400 group-hover:block hover:bg-slate-100 hover:text-indigo-600 focus:block"
                    >
                      {pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="hidden md:block">
          <UserPanel />
        </div>
      </aside>

      <div className={`min-w-0 flex-1 ${chatOpen ? 'flex' : 'hidden md:flex'} flex-col`}>
        {roomId !== null ? (
          activeRoom ? (
            <RoomChat
              room={activeRoom}
              myUsername={user?.username}
              onRead={handleRoomRead}
              onLeft={() => {
                reloadRooms();
                navigate('/messages');
              }}
              onChanged={reloadRooms}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          )
        ) : partnerId === null ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Lumi mood="happy" size={96} />
            <p className="mt-2 text-lg font-bold text-ink">Elige una conversación</p>
            <p className="max-w-xs text-sm text-soft">
              Escríbele a un compañero o arma un chat grupal con el botón + de la izquierda.
            </p>
            <button
              type="button"
              onClick={() => setRoomModalOpen(true)}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <Users size={16} /> Crear chat grupal
            </button>
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
      <RoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        onSaved={(room) => {
          reloadRooms();
          navigate(`/messages/rooms/${room.id}`);
        }}
      />
    </div>
  );
};
