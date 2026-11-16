import React from 'react';
import { Link } from 'react-router-dom';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';

const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });
const DATE = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const stampOf = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return `Hoy a las ${TIME.format(date)}`;
  if (date.toDateString() === yesterday.toDateString()) return `Ayer a las ${TIME.format(date)}`;
  return `${DATE.format(date)} ${TIME.format(date)}`;
};

const NAME_COLORS = ['text-lumi-ink', 'text-mint-ink', 'text-chicle-ink', 'text-celeste-ink', 'text-[#5646e0] dark:text-[#a597ff]', 'text-[#b4440f] dark:text-[#ff8a5c]'];

const nameColor = (authorId: number) => NAME_COLORS[Math.abs(authorId) % NAME_COLORS.length];

const GROUP_WINDOW_MS = 7 * 60 * 1000;

export const withinGroupWindow = (previous: string, current: string) =>
  new Date(current).getTime() - new Date(previous).getTime() < GROUP_WINDOW_MS;

interface ChatRowProps {
  id?: string;
  authorId: number;
  username: string;
  avatarUrl?: string | null;
  advisor?: boolean;
  createdAt: string;
  grouped: boolean;
  children: React.ReactNode;
}

export const ChatRow: React.FC<ChatRowProps> = ({ id, authorId, username, avatarUrl, advisor, createdAt, grouped, children }) => {
  const date = new Date(createdAt);
  return (
    <div id={id} className={`group/row relative flex gap-4 px-4 py-0.5 transition-colors hover:bg-black/[0.04] dark:hover:bg-black/10 ${grouped ? '' : 'mt-3'}`}>
      <div className="w-10 shrink-0">
        {grouped ? (
          <time
            dateTime={createdAt}
            className="invisible block pt-1 text-right text-[11px] text-slate-400 group-hover/row:visible"
          >
            {TIME.format(date)}
          </time>
        ) : (
          <Link to={`/users/${authorId}`} aria-label={`Ver perfil de ${username}`} className="block pt-0.5">
            <UserAvatar username={username} avatarUrl={avatarUrl} size={40} />
          </Link>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped && (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <Link to={`/users/${authorId}`} className={`text-[15px] font-bold hover:underline ${nameColor(authorId)}`}>
              {username}
            </Link>
            {advisor && <AdvisorBadge compact />}
            <time dateTime={createdAt} className="text-xs text-slate-400">
              {stampOf(date)}
            </time>
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export const DaySeparator: React.FC<{ label: string }> = ({ label }) => (
  <div className="mx-4 mt-5 mb-1 flex items-center gap-2 text-xs font-semibold text-slate-400" role="separator">
    <span className="h-px flex-1 bg-slate-200" />
    {label}
    <span className="h-px flex-1 bg-slate-200" />
  </div>
);
