import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Bookmark, BookmarkX, Hash } from 'lucide-react';
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
          {(data ?? []).map((item) => {
            const target = `/groups/${item.groupId}?channel=${item.message.channelId ?? ''}&message=${item.message.id}`;
            return (
              <li key={item.message.id} className="group/saved relative rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300">
                <div className="flex items-start gap-3">
                  <UserAvatar username={item.message.authorUsername} avatarUrl={item.message.authorAvatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-bold text-slate-900">@{item.message.authorUsername}</span>
                      <span className="text-xs text-slate-400">{WHEN.format(new Date(item.message.createdAt))}</span>
                    </div>
                    <div className="mt-0.5 text-[15px] break-words text-slate-700">
                      {item.message.content ? <RichText content={item.message.content} /> : previewOf(item.message) || 'Encuesta'}
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {item.groupName} <Hash size={11} />
                      {item.channelName ?? 'general'}
                    </p>
                  </div>
                  <div className="relative z-10 flex shrink-0 items-center gap-1">
                    <Link
                      to={target}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700"
                    >
                      Ir al mensaje <ArrowRight size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(item)}
                      aria-label="Quitar de guardados"
                      title="Quitar de guardados"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <BookmarkX size={16} />
                    </button>
                  </div>
                </div>
                <Link to={target} aria-hidden="true" tabIndex={-1} className="absolute inset-0 rounded-3xl" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
