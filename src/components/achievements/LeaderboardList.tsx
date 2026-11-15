import React from 'react';
import { LeaderboardEntry } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { AdvisorBadge } from '../common/AdvisorBadge';

const MEDALS = ['bg-amber-400 text-white', 'bg-slate-300 text-slate-700', 'bg-orange-300 text-white'];

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ entries, currentUserId }) => (
  <ol className="divide-y divide-slate-100">
    {entries.map((entry) => (
      <li
        key={entry.userId}
        className={`flex items-center gap-3 px-2 py-2.5 ${entry.userId === currentUserId ? 'rounded-xl bg-indigo-50/70' : ''}`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            MEDALS[entry.position - 1] ?? 'bg-slate-100 text-slate-500'
          }`}
        >
          {entry.position}
        </span>
        <UserAvatar username={entry.username} avatarUrl={entry.avatarUrl} size={32} />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-800">@{entry.username}</span>
          {entry.advisor && <AdvisorBadge compact />}
        </div>
        <span className="text-sm font-bold text-indigo-700">{entry.points} pts</span>
      </li>
    ))}
  </ol>
);
