import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, FileText } from 'lucide-react';
import { GroupResponse } from '../../types';
import { timeAgo } from '../../utils/relativeTime';
import { UnreadBadge } from '../common/UnreadBadge';
import { VisibilityBadge } from './VisibilityBadge';

const describeUnread = (group: GroupResponse) => {
  const parts: string[] = [];
  const documents = group.unreadDocuments ?? 0;
  const sessions = group.unreadSessions ?? 0;
  if (documents > 0) parts.push(documents === 1 ? '1 documento nuevo' : `${documents} documentos nuevos`);
  if (sessions > 0) parts.push(sessions === 1 ? '1 sesión nueva' : `${sessions} sesiones nuevas`);
  return parts.join(' · ');
};

export const MyGroupRow: React.FC<{ group: GroupResponse }> = ({ group }) => {
  const unread = group.unreadCount ?? 0;

  return (
    <Link
      to={`/groups/${group.id}`}
      state={{ group }}
      className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-xs transition hover:border-indigo-200 hover:shadow-md ${
        unread > 0 ? 'border-indigo-200' : 'border-slate-200'
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
        {group.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm text-slate-900 ${unread > 0 ? 'font-bold' : 'font-semibold'}`}>{group.name}</p>
          <VisibilityBadge visibility={group.visibility} />
        </div>
        {unread > 0 ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-indigo-700">
            {(group.unreadDocuments ?? 0) > 0 ? <FileText size={12} /> : <CalendarDays size={12} />}
            {describeUnread(group)}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500">
            {group.memberCount === 1 ? '1 miembro' : `${group.memberCount} miembros`} · Última actividad{' '}
            {timeAgo(group.lastActivityAt).toLowerCase()}
          </p>
        )}
      </div>
      <UnreadBadge count={unread} />
      <ChevronRight size={18} className="text-slate-400" />
    </Link>
  );
};
