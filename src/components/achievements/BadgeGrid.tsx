import React from 'react';
import { Award, BookMarked, CalendarCheck, Crown, Library, ListChecks, MessageSquareText, Lock } from 'lucide-react';
import { Badge } from '../../types';

const ICONS: Record<string, React.ReactNode> = {
  FIRST_UPLOAD: <BookMarked size={20} />,
  LIBRARIAN: <Library size={20} />,
  CRITIC: <MessageSquareText size={20} />,
  ORGANIZER: <CalendarCheck size={20} />,
  LOYAL: <Award size={20} />,
  PLANNER: <ListChecks size={20} />,
  TOP_ADVISOR: <Crown size={20} />,
};

export const BadgeGrid: React.FC<{ badges: Badge[] }> = ({ badges }) => (
  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    {badges.map((badge) => (
      <li
        key={badge.code}
        className={`rounded-2xl border p-4 text-center transition ${
          badge.earned ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50 opacity-70'
        }`}
      >
        <div
          className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full ${
            badge.earned ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'
          }`}
        >
          {badge.earned ? ICONS[badge.code] ?? <Award size={20} /> : <Lock size={18} />}
        </div>
        <p className="text-sm font-bold text-slate-800">{badge.name}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{badge.description}</p>
      </li>
    ))}
  </ul>
);
