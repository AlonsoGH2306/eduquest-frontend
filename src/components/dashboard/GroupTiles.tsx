import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { GroupResponse } from '../../types';
import { GroupAvatar, GroupBanner } from '../groups/GroupAvatar';

interface GroupTilesProps {
  groups: GroupResponse[];
}

const describe = (group: GroupResponse) => {
  const mentions = group.unreadMentions ?? 0;
  const unread = (group.unreadCount ?? 0) + (group.unreadMessages ?? 0);
  if (mentions > 0) return { text: mentions === 1 ? 'Te mencionaron' : `Te mencionaron ${mentions} veces`, className: 'text-chicle-ink' };
  if (unread > 0) return { text: unread === 1 ? '1 novedad' : `${unread} novedades`, className: 'text-slate-900' };
  return {
    text: group.memberCount === 1 ? '1 integrante' : `${group.memberCount} integrantes`,
    className: 'text-slate-500',
  };
};

export const GroupTiles: React.FC<GroupTilesProps> = ({ groups }) => (
  <section aria-labelledby="tus-grupos">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id="tus-grupos" className="text-xl font-bold text-slate-900">
        Tus grupos
      </h2>
      <Link to="/groups?view=explore" className="text-sm font-semibold text-indigo-500 hover:underline">
        Explorar grupos
      </Link>
    </div>
    {groups.length === 0 ? (
      <Link
        to="/groups?view=explore"
        className="flex items-center gap-4 rounded-2xl bg-raised p-5 text-[15px] text-slate-600 transition hover:text-slate-900"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-mint text-noche">
          <Compass size={22} />
        </span>
        Aún no estás en ningún grupo. Únete al de tu curso o crea uno para estudiar con tus compañeros.
      </Link>
    ) : (
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.slice(0, 8).map((group) => {
          const status = describe(group);
          return (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className="flex h-full flex-col overflow-hidden rounded-2xl bg-raised transition hover:-translate-y-0.5"
              >
                <GroupBanner group={group} className="h-16" />
                <span className="flex flex-1 flex-col gap-1 px-4 pb-4">
                  <GroupAvatar group={group} size={48} radius={16} className="relative -mt-6 mb-1 ring-4 ring-[var(--eq-raised)]" />
                  <span className="truncate text-[15px] font-bold text-slate-900">{group.name}</span>
                  <span className={`text-sm font-semibold ${status.className}`}>{status.text}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);
