import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkX, Hash } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { groupService } from '../services/groupService';
import { SavedMessage } from '../types';
import { extractErrorMessage } from '../utils/errors';
import { previewOf } from '../utils/chatMessages';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { UserAvatar } from '../components/common/UserAvatar';
import { RichText } from '../components/chat/RichText';

const WHEN = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const SavedMessagesPage: React.FC = () => {
  const fetcher = useCallback((signal: AbortSignal) => groupService.getSavedMessages(signal), []);
  const { data, setData, loading, error, reload } = useFetch<SavedMessage[]>(fetcher);

  const remove = async (item: SavedMessage) => {
    try {
      await groupService.setSaved(item.groupId, item.message.id, false);
      setData((current) => (current ?? []).filter((entry) => entry.message.id !== item.message.id));
      toast.success('Quitado de guardados');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Mensajes guardados' }]} />
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Bookmark size={22} className="text-indigo-600" /> Mensajes guardados
      </h1>
      <p className="mb-6 text-sm text-slate-500">Explicaciones, enlaces y avisos de tus grupos para leer después.</p>
      {loading ? (
        <SkeletonCard count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="Aún no guardaste mensajes"
          description="En el chat de un grupo, pasa el cursor sobre un mensaje y toca el marcador."
        />
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((item) => (
            <li key={item.message.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <UserAvatar username={item.message.authorUsername} avatarUrl={item.message.authorAvatarUrl} size={24} />
                <span className="font-semibold text-slate-800">@{item.message.authorUsername}</span>
                <span>·</span>
                <Link
                  to={`/groups/${item.groupId}?tab=chat&channel=${item.message.channelId ?? ''}&message=${item.message.id}`}
                  className="inline-flex items-center gap-0.5 font-medium text-indigo-600 hover:underline"
                >
                  {item.groupName} <Hash size={11} />
                  {item.channelName}
                </Link>
                <span className="ml-auto">{WHEN.format(new Date(item.message.createdAt))}</span>
                <button
                  type="button"
                  onClick={() => void remove(item)}
                  aria-label="Quitar de guardados"
                  title="Quitar de guardados"
                  className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <BookmarkX size={14} />
                </button>
              </div>
              <div className="text-sm text-slate-700">
                {item.message.content ? <RichText content={item.message.content} /> : previewOf(item.message) || 'Encuesta'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
