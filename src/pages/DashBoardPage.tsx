import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatDateTime } from '../utils/formatDate';
import { StatCard } from '../components/dashboard/StatCard';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { LeaderboardList } from '../components/achievements/LeaderboardList';
import { useLeaderboard } from '../hooks/useAchievements';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { DocumentResponse } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, canManageUsers } = useAuth();
  const { stats, loading, error, reload } = useDashboardStats();
  const leaderboard = useLeaderboard('week');
  const value = (count?: number) => (loading ? null : (count ?? 0));
  const [previewing, setPreviewing] = useState<DocumentResponse | null>(null);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-linear-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck size={14} /> Plataforma académica colaborativa
            </span>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">¡Hola, {user?.username}! 👋</h1>
            <p className="mt-1 max-w-xl text-sm text-indigo-100">
              Explora apuntes de la comunidad, colabora en grupos de estudio y genera planes de estudio a tu medida.
            </p>
          </div>
          <Link
            to="/study-planner"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-50"
          >
            <Sparkles size={16} /> Generar plan de estudio
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState title="No pudimos cargar tu resumen" message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard
              label="Documentos públicos"
              value={value(stats?.documents)}
              icon={<FileText size={20} />}
              to="/documents"
              linkLabel="Ir a la biblioteca"
              accent="indigo"
            />
            <StatCard
              label="Grupos disponibles"
              value={value(stats?.groups)}
              icon={<Users size={20} />}
              to="/groups"
              linkLabel="Explorar grupos"
              accent="emerald"
            />
            <StatCard
              label="Mis planes de estudio"
              value={value(stats?.plans)}
              icon={<Sparkles size={20} />}
              to="/study-planner"
              linkLabel="Ver mi historial"
              accent="violet"
            />
          </div>

          {stats && stats.featuredDocuments.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-xs">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Sparkles size={18} className="text-amber-500" /> Destacados por la comunidad
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.featuredDocuments.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setPreviewing(doc)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-amber-300 hover:shadow-md"
                    >
                      <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
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
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recién subido</h2>
                <Link to="/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
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
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
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

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
                  <Trophy size={16} className="text-amber-500" /> Top de la semana
                </h2>
                <Link to="/achievements" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
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
          Tienes acceso a la administración de usuarios. Encuéntrala en la pestaña <strong>Admin</strong> de la barra superior.
        </div>
      )}
      <DocumentPreviewModal document={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
};
