import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pin, Search, X } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { useFetch } from '../../hooks/useFetch';
import { GroupMessage } from '../../types';
import { extractErrorMessage, isCanceledError } from '../../utils/errors';
import { previewOf } from '../../utils/chatMessages';
import { UserAvatar } from '../common/UserAvatar';
import { Spinner } from '../common/Spinner';

const WHEN = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const SEARCH_DELAY_MS = 350;

interface PanelShellProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

export const PanelShell: React.FC<PanelShellProps> = ({ title, icon, onClose, children }) => (
  <aside className="flex w-full shrink-0 flex-col border-t border-slate-100 bg-white md:w-80 md:border-t-0 md:border-l">
    <header className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
      <span className="text-indigo-600">{icon}</span>
      <h3 className="flex-1 text-sm font-bold text-slate-900">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar panel"
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </header>
    {children}
  </aside>
);

const MessageRow: React.FC<{ message: GroupMessage; onSelect: (message: GroupMessage) => void }> = ({ message, onSelect }) => (
  <li>
    <button
      type="button"
      onClick={() => onSelect(message)}
      className="flex w-full gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
    >
      <UserAvatar username={message.authorUsername} avatarUrl={message.authorAvatarUrl} size={28} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-800">@{message.authorUsername}</span>
          <span className="text-slate-400">{WHEN.format(new Date(message.createdAt))}</span>
        </span>
        <span className="line-clamp-3 text-sm break-words text-slate-600">{previewOf(message) || 'Encuesta'}</span>
      </span>
    </button>
  </li>
);

interface PinsPanelProps {
  groupId: number;
  channelId: number;
  refreshKey: number;
  onSelect: (message: GroupMessage) => void;
  onClose: () => void;
}

export const PinsPanel: React.FC<PinsPanelProps> = ({ groupId, channelId, refreshKey, onSelect, onClose }) => {
  const fetcher = useCallback(
    (signal: AbortSignal) => groupService.getPinned(groupId, channelId, signal),
    [groupId, channelId]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  useEffect(() => {
    if (refreshKey > 0) reload();
  }, [refreshKey, reload]);

  return (
    <PanelShell title="Mensajes fijados" icon={<Pin size={16} />} onClose={onClose}>
      <div className="flex-1 overflow-y-auto p-2">
        {loading && <Spinner label="Cargando..." />}
        {error && <p className="p-3 text-sm text-red-600">{error}</p>}
        {!loading && !error && (data?.length ?? 0) === 0 && (
          <p className="p-4 text-center text-sm text-slate-500">Aún no hay mensajes fijados en este canal.</p>
        )}
        <ul className="space-y-1">
          {data?.map((message) => <MessageRow key={message.id} message={message} onSelect={onSelect} />)}
        </ul>
      </div>
    </PanelShell>
  );
};

interface SearchPanelProps {
  groupId: number;
  channelId: number;
  onSelect: (message: GroupMessage) => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ groupId, channelId, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [onlyChannel, setOnlyChannel] = useState(true);
  const [results, setResults] = useState<GroupMessage[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      groupService
        .searchMessages(groupId, text, onlyChannel ? channelId : undefined, controller.signal)
        .then(setResults)
        .catch((err) => {
          if (!isCanceledError(err)) toast.error(extractErrorMessage(err));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, SEARCH_DELAY_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, onlyChannel, groupId, channelId]);

  return (
    <PanelShell title="Buscar en el chat" icon={<Search size={16} />} onClose={onClose}>
      <div className="space-y-2 border-b border-slate-100 p-3">
        <label htmlFor="chat-search" className="sr-only">
          Buscar mensajes
        </label>
        <input
          id="chat-search"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Palabra o frase…"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
        />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={onlyChannel} onChange={(event) => setOnlyChannel(event.target.checked)} />
          Solo en este canal
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading && <Spinner label="Buscando..." />}
        {!loading && results !== null && results.length === 0 && (
          <p className="p-4 text-center text-sm text-slate-500">No encontramos mensajes con ese texto.</p>
        )}
        {!loading && results === null && (
          <p className="p-4 text-center text-xs text-slate-400">Escribe al menos 2 caracteres.</p>
        )}
        <ul className="space-y-1">
          {results?.map((message) => <MessageRow key={message.id} message={message} onSelect={onSelect} />)}
        </ul>
      </div>
    </PanelShell>
  );
};
