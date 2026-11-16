import React, { useState } from 'react';
import { Flame, Medal, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAchievements, useLeaderboard } from '../hooks/useAchievements';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ErrorState } from '../components/common/ErrorState';
import { Spinner } from '../components/common/Spinner';
import { BadgeGrid } from '../components/achievements/BadgeGrid';
import { LeaderboardList } from '../components/achievements/LeaderboardList';
import { LeaderboardPeriod } from '../types';

const POINT_RULES = [
  { label: 'Tu respuesta del foro es elegida como la solución', points: 8 },
  { label: 'Dictar una asesoría a la que asiste alguien', points: 10 },
  { label: 'Asistir a una asesoría («Unirme ahora»)', points: 5 },
  { label: 'Compartir un material', points: 5 },
  { label: 'Tu material recibe una reseña de 4 o 5 estrellas', points: 3 },
  { label: 'Reseñar un material', points: 2 },
  { label: 'Calificar una asesoría', points: 2 },
  { label: 'Cada ▲ que recibe tu respuesta (hasta 5)', points: 1 },
  { label: 'Confirmar y no asistir', points: -3 },
];

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading, error, reload } = useAchievements();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const leaderboard = useLeaderboard(period);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Logros' }]} />
      <h1 className="text-2xl font-bold text-slate-900">Logros y ranking</h1>
      <p className="mb-6 text-sm text-slate-500">Gana puntos ayudando a la comunidad y desbloquea insignias.</p>

      {loading ? (
        <Spinner size={30} label="Cargando tus logros..." />
      ) : error || !profile ? (
        <ErrorState message={error ?? 'No se pudieron cargar tus logros'} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-md">
                <Trophy size={20} />
                <p className="mt-3 text-3xl font-extrabold">{profile.points}</p>
                <p className="text-xs text-indigo-100">puntos totales</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <Flame size={20} className="text-orange-500" />
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{profile.weeklyPoints}</p>
                <p className="text-xs text-slate-500">puntos esta semana</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <Medal size={20} className="text-amber-500" />
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{profile.rank ? `#${profile.rank}` : '—'}</p>
                <p className="text-xs text-slate-500">{profile.rank ? 'puesto general' : 'suma puntos para entrar al ranking'}</p>
              </div>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="mb-1 text-base font-bold text-slate-900">Insignias</h2>
              <p className="mb-4 text-xs text-slate-500">
                {profile.badges.filter((badge) => badge.earned).length} de {profile.badges.length} desbloqueadas
              </p>
              <BadgeGrid badges={profile.badges} />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-base font-bold text-slate-900">¿Cómo se ganan puntos?</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {POINT_RULES.map((rule) => (
                  <li key={rule.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">{rule.label}</span>
                    <span className={`shrink-0 font-bold ${rule.points < 0 ? 'text-red-600' : 'text-indigo-700'}`}>
                      {rule.points > 0 ? `+${rule.points}` : rule.points}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="self-start rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">Ranking</h2>
              <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold" role="tablist">
                {(['week', 'all'] as LeaderboardPeriod[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={period === option}
                    onClick={() => setPeriod(option)}
                    className={`rounded-full px-3 py-1 transition ${
                      period === option ? 'bg-indigo-600 text-white' : 'text-slate-500'
                    }`}
                  >
                    {option === 'week' ? 'Semana' : 'Histórico'}
                  </button>
                ))}
              </div>
            </div>
            {leaderboard.loading ? (
              <Spinner size={22} label="Cargando ranking..." />
            ) : leaderboard.error ? (
              <ErrorState message={leaderboard.error} onRetry={leaderboard.reload} />
            ) : leaderboard.entries.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Nadie ha sumado puntos {period === 'week' ? 'esta semana' : 'todavía'}. ¡Sé el primero!
              </p>
            ) : (
              <LeaderboardList entries={leaderboard.entries} currentUserId={user?.id} />
            )}
          </section>
        </div>
      )}
    </div>
  );
};
