import React from 'react';
import { Crown, Flag, MessageCircle } from 'lucide-react';
import { GroupMember } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';

interface MemberListProps {
  members: GroupMember[];
  currentUserId?: number;
  onReport?: (member: GroupMember) => void;
  onMessage?: (member: GroupMember) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ members, currentUserId, onReport, onMessage }) => (
  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {members.map((member) => {
      const isCreator = member.groupRole === 'CREATOR';
      const isMe = member.id === currentUserId;
      return (
        <li key={member.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <UserAvatar username={member.username} avatarUrl={member.avatarUrl} size={44} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
              @{member.username}
              {isMe && <span className="font-normal text-slate-400">(tú)</span>}
              {member.advisor && <AdvisorBadge />}
            </p>
            <p className="text-xs text-slate-500">{isCreator ? 'Creó este grupo' : 'Integrante del grupo'}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              isCreator ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isCreator && <Crown size={12} />} {isCreator ? 'Creador' : 'Miembro'}
          </span>
          {onMessage && !isMe && (
            <button
              type="button"
              onClick={() => onMessage(member)}
              aria-label={`Enviar mensaje a ${member.username}`}
              title="Enviar mensaje"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              <MessageCircle size={14} />
            </button>
          )}
          {onReport && !isMe && (
            <button
              type="button"
              onClick={() => onReport(member)}
              aria-label={`Reportar a ${member.username}`}
              title="Reportar usuario"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Flag size={14} />
            </button>
          )}
        </li>
      );
    })}
  </ul>
);
