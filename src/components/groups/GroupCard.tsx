import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, UserPlus, User, Lock, Check } from 'lucide-react';
import { GroupResponse } from '../../types';
import { VisibilityBadge } from './VisibilityBadge';

interface GroupCardProps {
  group: GroupResponse;
  onJoin: (group: GroupResponse) => void;
  joiningId: number | null;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, joiningId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users size={20} />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            <User size={11} /> Creador: @{group.creatorUsername}
          </span>
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

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        {group.member ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check size={14} /> Ya eres miembro
          </span>
        ) : (
          <button
            type="button"
            disabled={joiningId === group.id}
            onClick={() => onJoin(group)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
          >
            {group.visibility === 'PRIVATE' ? <Lock size={14} /> : <UserPlus size={14} />}
            {joiningId === group.id ? 'Uniéndose...' : 'Unirse'}
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(`/groups/${group.id}`, { state: { group } })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
        >
          Abrir Grupo <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};