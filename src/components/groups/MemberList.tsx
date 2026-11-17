import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Flag, MessageCircle, Shield, ShieldCheck, ShieldOff, UserMinus } from 'lucide-react';
import { GroupMember } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';
import { availabilityDot, availabilityLabel } from '../../utils/availability';

interface MemberListProps {
  members: GroupMember[];
  currentUserId?: number;
  onReport?: (member: GroupMember) => void;
  onMessage?: (member: GroupMember) => void;
  onRemove?: (member: GroupMember) => void;
  canRemove?: (member: GroupMember) => boolean;
  onToggleModerator?: (member: GroupMember) => void;
  onlineIds?: Set<number>;
}

const ROLE_STYLES: Record<GroupMember['groupRole'], { label: string; className: string; icon: React.ReactNode }> = {
  CREATOR: { label: 'Creador', className: 'bg-amber-100 text-amber-800', icon: <Crown size={12} /> },
  MODERATOR: { label: 'Moderador', className: 'bg-emerald-50 text-emerald-700', icon: <Shield size={12} /> },
  MEMBER: { label: 'Miembro', className: 'bg-slate-100 text-slate-600', icon: null },
};

const ROLE_DESCRIPTION: Record<GroupMember['groupRole'], string> = {
  CREATOR: 'Creó este grupo',
  MODERATOR: 'Ayuda a moderar el grupo',
  MEMBER: 'Integrante del grupo',
};

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserId,
  onReport,
  onMessage,
  onRemove,
  canRemove,
  onToggleModerator,
  onlineIds,
}) => (
  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {members.map((member) => {
      const isCreator = member.groupRole === 'CREATOR';
      const isMe = member.id === currentUserId;
      const role = ROLE_STYLES[member.groupRole];
      const online = onlineIds?.has(member.id) ?? false;
      return (
        <li key={member.id} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4">
          <Link to={`/users/${member.id}`} aria-label={`Ver perfil de ${member.username}`} className="relative shrink-0">
            <UserAvatar username={member.username} avatarUrl={member.avatarUrl} size={44} />
            {onlineIds && (
              <span
                title={online ? availabilityLabel(member.availability) : 'Desconectado'}
                className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${availabilityDot(
                  member.availability,
                  online
                )}`}
              />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
              <Link to={`/users/${member.id}`} className="truncate hover:text-indigo-600 hover:underline">
                @{member.username}
              </Link>
              {isMe && <span className="font-normal text-slate-400">(tú)</span>}
              {member.advisor && <AdvisorBadge />}
            </p>
            <p className="text-xs text-slate-500">
              {ROLE_DESCRIPTION[member.groupRole]}
              {onlineIds && online && <span className="text-emerald-600"> · {availabilityLabel(member.availability).toLowerCase()}</span>}
            </p>
            {(member.statusText || member.statusEmoji) && (
              <p className="truncate text-xs text-slate-600">
                {member.statusEmoji} {member.statusText}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${role.className}`}>
            {role.icon} {role.label}
          </span>
          {onToggleModerator && !isMe && !isCreator && (
            <button
              type="button"
              onClick={() => onToggleModerator(member)}
              aria-label={
                member.groupRole === 'MODERATOR' ? `Quitar moderación a ${member.username}` : `Nombrar moderador a ${member.username}`
              }
              title={member.groupRole === 'MODERATOR' ? 'Quitar moderador' : 'Nombrar moderador'}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {member.groupRole === 'MODERATOR' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
            </button>
          )}
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
          {onRemove && !isMe && !isCreator && (canRemove?.(member) ?? true) && (
            <button
              type="button"
              onClick={() => onRemove(member)}
              aria-label={`Quitar a ${member.username} del grupo`}
              title="Quitar del grupo"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <UserMinus size={14} />
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
