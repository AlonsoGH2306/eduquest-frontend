import React from 'react';
import { Link } from 'react-router-dom';
import { AtSign, CalendarDays, ChevronRight, FileText, MessageCircle, Pin, PinOff } from 'lucide-react';
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
  const messages = group.unreadMessages ?? 0;
  if (messages > 0) parts.push(messages === 1 ? '1 mensaje nuevo en el chat' : `${messages} mensajes nuevos en el chat`);
  return parts.join(' · ');
};

interface MyGroupRowProps {
  group: GroupResponse;
  pinned?: boolean;
  onTogglePin?: () => void;
}

export const MyGroupRow: React.FC<MyGroupRowProps> = ({ group, pinned = false, onTogglePin }) => {
  const mentions = group.unreadMentions ?? 0;
  const messages = group.unreadMessages ?? 0;
  const unread = (group.unreadCount ?? 0) + messages;
  const onlyMessages = messages > 0 && unread === messages;
  const Icon = (group.unreadDocuments ?? 0) > 0 ? FileText : (group.unreadSessions ?? 0) > 0 ? CalendarDays : MessageCircle;

  return (
    <Link
      to={onlyMessages || mentions > 0 ? `/groups/${group.id}?tab=chat` : `/groups/${group.id}`}
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
          {pinned && <Pin size={12} className="shrink-0 text-indigo-500" aria-label="Fijado" />}
          <p className={`truncate text-sm text-slate-900 ${unread > 0 ? 'font-bold' : 'font-semibold'}`}>{group.name}</p>
          <VisibilityBadge visibility={group.visibility} />
        </div>
        {unread > 0 ? (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-indigo-700">
            <Icon size={12} className="shrink-0" />
            {describeUnread(group)}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-slate-500">
            {group.memberCount === 1 ? '1 miembro' : `${group.memberCount} miembros`} ·{' '}
            {group.lastActivityAt ? `Última actividad ${timeAgo(group.lastActivityAt)}` : 'Sin actividad reciente'}
          </p>
        )}
      </div>
      {mentions > 0 && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
          title={mentions === 1 ? 'Te mencionaron 1 vez' : `Te mencionaron ${mentions} veces`}
        >
          <AtSign size={10} />
          {mentions}
        </span>
      )}
      <UnreadBadge count={unread} />
      {onTogglePin && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onTogglePin();
          }}
          aria-label={pinned ? 'Desfijar grupo' : 'Fijar grupo arriba'}
          title={pinned ? 'Desfijar' : 'Fijar arriba'}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
        >
          {pinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
      )}
      <ChevronRight size={18} className="text-slate-400" />
    </Link>
  );
};
