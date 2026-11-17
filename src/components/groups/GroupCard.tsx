import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus, User, Lock, Check } from 'lucide-react';
import { GroupResponse } from '../../types';
import { VisibilityBadge } from './VisibilityBadge';
import { GroupAvatar, GroupBanner } from './GroupAvatar';

interface GroupCardProps {
  group: GroupResponse;
  onJoin: (group: GroupResponse) => void;
  joiningId: number | null;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, joiningId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-raised transition hover:-translate-y-0.5 hover:shadow-lg">
      <GroupBanner group={group} className="h-16" />
      <div className="px-4 pb-4">
        <div className="-mt-7 mb-2 flex items-end justify-between gap-2">
          <GroupAvatar group={group} size={56} radius={18} className="relative ring-[5px] ring-[var(--eq-raised)]" />
          {group.creatorUsername && (
            <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] font-medium text-slate-500">
              <User size={11} className="shrink-0" /> @{group.creatorUsername}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900">{group.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
          {group.description || 'Grupo colaborativo de estudio universitario.'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <VisibilityBadge visibility={group.visibility} />
          <span className="text-slate-500">
            {group.memberCount === 1 ? '1 miembro' : `${group.memberCount} miembros`}
          </span>
          <span className="font-mono tracking-wider text-slate-400">#{group.code}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        {group.member ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check size={14} /> Ya eres miembro
          </span>
        ) : (
          <button
            type="button"
            disabled={joiningId === group.id}
            onClick={() => onJoin(group)}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {group.visibility === 'PRIVATE' ? <Lock size={14} /> : <UserPlus size={14} />}
            {joiningId === group.id ? 'Uniéndose...' : 'Unirse'}
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(`/groups/${group.id}`, { state: { group } })}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-indigo-600 hover:text-white"
        >
          Abrir grupo <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};