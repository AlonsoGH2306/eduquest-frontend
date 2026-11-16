import React, { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, FileText, MessageCircle, Pencil, Star, Trophy, UserCheck, UserPlus } from 'lucide-react';
import { userService } from '../services/userService';
import { useFetch } from '../hooks/useFetch';
import { DocumentResponse } from '../types';
import { extractErrorMessage } from '../utils/errors';
import { UserAvatar } from '../components/common/UserAvatar';
import { AdvisorBadge } from '../components/common/AdvisorBadge';
import { BadgeGrid } from '../components/achievements/BadgeGrid';
import { DocumentCard } from '../components/documents/DocumentCard';
import { ReviewModal } from '../components/documents/ReviewModal';
import { PaginationBar } from '../components/common/PaginationBar';
import { ErrorState } from '../components/common/ErrorState';
import { Spinner } from '../components/common/Spinner';

const PAGE_SIZE = 6;

const memberSince = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }) : null;

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</span>
    <div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  </div>
);

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const id = Number(userId);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE);
  const [reviewing, setReviewing] = useState<DocumentResponse | null>(null);
  const [toggling, setToggling] = useState(false);

  const profile = useFetch(useCallback((signal: AbortSignal) => userService.getProfile(id, signal), [id]));
  const documents = useFetch(
    useCallback((signal: AbortSignal) => userService.getDocuments(id, page, size, signal), [id, page, size])
  );

  const toggleFollow = async () => {
    if (!profile.data) return;
    const following = profile.data.followedByMe;
    setToggling(true);
    try {
      if (following) await userService.unfollow(id);
      else await userService.follow(id);
      profile.setData({
        ...profile.data,
        followedByMe: !following,
        followers: profile.data.followers + (following ? -1 : 1),
      });
      toast.success(following ? `Dejaste de seguir a @${profile.data.username}` : `Ahora sigues a @${profile.data.username}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setToggling(false);
    }
  };

  if (profile.loading && !profile.data) return <Spinner label="Cargando perfil..." />;
  if (profile.error || !profile.data) {
    return <ErrorState message={profile.error ?? 'Usuario no encontrado'} onRetry={profile.reload} />;
  }

  const user = profile.data;
  const since = memberSince(user.memberSince);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
        <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={88} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold text-slate-900">@{user.username}</h1>
            {user.advisor && <AdvisorBadge />}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>
              <strong className="text-slate-900">{user.followers}</strong> {user.followers === 1 ? 'seguidor' : 'seguidores'}
            </span>
            <span>
              <strong className="text-slate-900">{user.following}</strong> siguiendo
            </span>
            {since && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={14} /> Miembro desde {since}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {user.me ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Pencil size={16} /> Editar mi perfil
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleFollow}
                disabled={toggling}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                  user.followedByMe
                    ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {user.followedByMe ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {user.followedByMe ? 'Siguiendo' : 'Seguir'}
              </button>
              <Link
                to={`/messages/${user.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <MessageCircle size={16} /> Mensaje
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Star size={18} />} label="Puntos" value={user.points} />
        <Stat icon={<Trophy size={18} />} label="Puesto en el ranking" value={user.rank ? `#${user.rank}` : '—'} />
        <Stat icon={<FileText size={18} />} label="Materiales compartidos" value={user.stats.documents} />
        <Stat icon={<CalendarDays size={18} />} label="Asesorías dictadas" value={user.stats.sessionsHosted} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Insignias</h2>
        {user.badges.length > 0 ? (
          <BadgeGrid badges={user.badges} />
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            {user.me ? 'Todavía no ganas insignias.' : `@${user.username} todavía no gana insignias.`}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Materiales públicos</h2>
        {documents.loading && !documents.data ? (
          <Spinner label="Cargando materiales..." />
        ) : documents.error ? (
          <ErrorState message={documents.error} onRetry={documents.reload} />
        ) : documents.data && documents.data.content.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.data.content.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onOpenReviews={setReviewing} onChanged={documents.reload} />
              ))}
            </div>
            {documents.data.totalPages > 1 && (
              <div className="mt-4">
                <PaginationBar
                  page={documents.data.page}
                  size={documents.data.size}
                  totalElements={documents.data.totalElements}
                  totalPages={documents.data.totalPages}
                  onPageChange={setPage}
                  onSizeChange={(next) => {
                    setSize(next);
                    setPage(0);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No ha compartido material en la biblioteca pública.
          </p>
        )}
      </section>

      <ReviewModal document={reviewing} onClose={() => setReviewing(null)} />
    </div>
  );
};
