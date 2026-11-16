import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatDateTime } from '../utils/formatDate';
import { NightHero } from '../components/dashboard/NightHero';
import { LiveNow } from '../components/dashboard/LiveNow';
import { GroupTiles } from '../components/dashboard/GroupTiles';
import { useLiveActivity } from '../hooks/useLiveActivity';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { LeaderboardList } from '../components/achievements/LeaderboardList';
import { useLeaderboard } from '../hooks/useAchievements';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DocumentResponse } from '../types';
import { useMyGroups } from '../hooks/useMyGroups';

const DATE_FORMAT = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

export const DashboardPage: React.FC = () => {
  const { user, canManageUsers } = useAuth();
  const { stats, loading, error, reload } = useDashboardStats();
  const leaderboard = useLeaderboard('week');
  const value = (count?: number) => (loading ? null : (count ?? 0));
  const [previewing, setPreviewing] = useState<DocumentResponse | null>(null);
  const { groups } = useMyGroups();
  const today = DATE_FORMAT.format(new Date());
  const live = useLiveActivity(groups);
  const firstRoom = live.studyRooms[0];
  const heroMessage =
    live.peopleStudying > 0
      ? `Ahora mismo ${live.peopleStudying === 1 ? 'hay 1 persona estudiando' : `hay ${live.peopleStudying} personas estudiando`} en tus grupos. Súmate y no estudies solo.`
      : 'Tus grupos están en calma. Repasa un apunte, arma tu plan de la semana o enciende la primera luz en una sala de estudio.';

  return (
    <div className="space-y-10">
      <NightHero
        dateLabel={today}
        username={user?.username ?? ''}
        message={heroMessage}
        primary={
          firstRoom
            ? { to: `/groups/${firstRoom.group.id}`, label: 'Entrar a la sala de estudio' }
            : { to: '/study-planner', label: 'Generar mi plan de estudio' }
        }
        secondary={{ to: '/documents', label: 'Ir a la biblioteca' }}
        lively={live.peopleStudying > 0}
        stats={[
          { label: 'apuntes en la biblioteca', value: value(stats?.documents) },
          { label: 'grupos de estudio', value: value(stats?.groups) },
          { label: 'planes que generaste', value: value(stats?.plans) },
        ]}
      />

      <LiveNow studyRooms={live.studyRooms} voiceRooms={live.voiceRooms} sessions={live.sessions} loading={live.loading} />

      <GroupTiles groups={groups} />

      {error ? (
        <ErrorState title="No pudimos cargar tu resumen" message={error} onRetry={reload} />
      ) : (
        <>
          {stats && stats.featuredDocuments.length > 0 && (
            <section className="rounded-2xl bg-raised p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Sparkles size={20} className="text-lumi-ink" /> Destacados por la comunidad
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.featuredDocuments.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setPreviewing(doc)}
                      className="flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100"
                    >
                      <span className="rounded-lg bg-lumi p-2 text-noche">
                        <FileText size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-800">{doc.title}</span>
                        <span className="block truncate text-xs text-slate-500">
                          @{doc.authorUsername}
                          {doc.course ? ` · ${doc.course}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl bg-raised p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Recién subido</h2>
                <Link to="/documents" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:underline">
                  Ver todo <ArrowRight size={13} />
                </Link>
              </div>
              {loading ? (
                <ul className="space-y-3" aria-label="Cargando documentos recientes">
                  {[0, 1, 2].map((item) => (
                    <li key={item} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </ul>
              ) : stats && stats.recentDocuments.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {stats.recentDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3 py-3">
                      <div className="rounded-lg bg-celeste p-2 text-noche">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{doc.title}</p>
                        <p className="text-xs text-slate-500">
                          @{doc.authorUsername} · {formatDateTime(doc.uploadedAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewing(doc)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        Abrir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="Aún no hay documentos"
                  description="Sé el primero en compartir un apunte con la comunidad."
                />
              )}
            </section>

            <section className="rounded-2xl bg-raised p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <Trophy size={20} className="text-lumi-ink" /> Top de la semana
                </h2>
                <Link to="/achievements" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:underline">
                  Mis logros <ArrowRight size={13} />
                </Link>
              </div>
              {leaderboard.loading ? (
                <ul className="space-y-3" aria-label="Cargando ranking">
                  {[0, 1, 2].map((item) => (
                    <li key={item} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </ul>
              ) : leaderboard.entries.length > 0 ? (
                <LeaderboardList entries={leaderboard.entries.slice(0, 5)} currentUserId={user?.id} />
              ) : (
                <p className="py-6 text-center text-xs text-slate-400">
                  Aún nadie suma puntos esta semana. Comparte un apunte o agenda una asesoría para empezar.
                </p>
              )}
            </section>
          </div>
        </>
      )}

      {canManageUsers && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-900">
          Tienes acceso a la administración de usuarios. Encuéntrala en <strong>Administración</strong>, en la barra lateral.
        </div>
      )}
      <DocumentPreviewModal document={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
};
