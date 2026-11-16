import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useFetch } from '../../hooks/useFetch';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';

export const FollowingList: React.FC = () => {
  const { data, loading } = useFetch(useCallback((signal: AbortSignal) => userService.getFollowing(signal), []));

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-slate-900">Personas que sigo</h2>
      <p className="mt-1 text-xs text-slate-500">Te avisamos cuando compartan material en la biblioteca.</p>
      {loading && !data ? (
        <p className="mt-4 text-sm text-slate-400">Cargando...</p>
      ) : data && data.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {data.map((person) => (
            <li key={person.id}>
              <Link
                to={`/users/${person.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
              >
                <UserAvatar username={person.username} avatarUrl={person.avatarUrl} size={26} />@{person.username}
                {person.advisor && <AdvisorBadge compact />}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Aún no sigues a nadie. Abre el perfil de un compañero desde un grupo, el ranking o un material.
        </p>
      )}
    </section>
  );
};
