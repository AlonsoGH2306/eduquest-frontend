import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Compass } from 'lucide-react';
import { useMyGroups } from '../../hooks/useMyGroups';
import { usePinnedChats } from '../../hooks/usePinnedChats';
import { GroupResponse } from '../../types';
import { assetUrl, groupColor, groupInitials } from '../../utils/groupAvatar';

interface RailItemProps {
  to: string;
  label: string;
  active: boolean;
  unread?: boolean;
  badge?: number;
  mention?: boolean;
  children: React.ReactNode;
  tone?: 'brand' | 'action';
  background?: string;
  onNavigate?: () => void;
}

const RailItem: React.FC<RailItemProps> = ({ to, label, active, unread, badge = 0, mention, children, tone, background, onNavigate }) => {
  const idle =
    tone === 'action'
      ? 'bg-raised text-mint-ink hover:bg-mint hover:text-noche'
      : tone === 'brand'
        ? 'bg-raised text-ink hover:bg-indigo-600 hover:text-white'
        : 'font-display text-noche';
  return (
    <div className="group relative flex w-full justify-center">
      <span
        aria-hidden="true"
        className={`absolute top-1/2 left-0 w-1 -translate-y-1/2 rounded-r-full bg-ink transition-all ${
          active ? 'h-10' : unread ? 'h-2 group-hover:h-5' : 'h-0 group-hover:h-5'
        }`}
      />
      <NavLink
        to={to}
        title={label}
        aria-label={badge > 0 ? `${label}, ${badge} sin leer` : label}
        onClick={onNavigate}
        style={background && !tone ? { backgroundColor: background } : undefined}
        className={`relative flex h-12 w-12 items-center justify-center text-sm font-bold transition-all duration-150 ${
          active ? 'rounded-[16px]' : 'rounded-[24px] hover:rounded-[16px]'
        } ${active && tone === 'brand' ? 'bg-indigo-600 text-white' : idle}`}
      >
        {children}
        {badge > 0 && (
          <span className="absolute -right-1 -bottom-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-chicle px-1 text-[11px] font-extrabold text-noche ring-4 ring-[var(--eq-rail)]">
            {mention ? '@' : badge > 99 ? '99+' : badge}
          </span>
        )}
      </NavLink>
    </div>
  );
};

interface ServerRailProps {
  onNavigate?: () => void;
}

export const ServerRail: React.FC<ServerRailProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { groups } = useMyGroups();
  const { isPinned } = usePinnedChats();
  const activeGroupId = Number(pathname.match(/^\/groups\/(\d+)/)?.[1] ?? 0);
  const ordered: GroupResponse[] = [...groups].sort((a, b) => Number(isPinned('GROUP', b.id)) - Number(isPinned('GROUP', a.id)));

  return (
    <nav aria-label="Tus grupos" className="eq-scroll-hidden flex w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto bg-rail py-3">
      <RailItem to="/dashboard" label="Inicio de EduQuest" active={!activeGroupId && pathname !== '/groups'} tone="brand" onNavigate={onNavigate}>
        <BookOpen size={24} />
      </RailItem>
      <div className="mx-auto h-0.5 w-8 shrink-0 rounded-full bg-raised" />
      {ordered.map((group) => {
        const unread = (group.unreadCount ?? 0) + (group.unreadMessages ?? 0);
        const mentions = group.unreadMentions ?? 0;
        return (
          <RailItem
            key={group.id}
            to={`/groups/${group.id}`}
            label={group.name}
            active={group.id === activeGroupId}
            unread={unread > 0 && !group.muted}
            badge={mentions > 0 ? mentions : 0}
            mention={mentions > 0}
            background={groupColor(group)}
            onNavigate={onNavigate}
          >
            {group.iconUrl ? (
              <img src={assetUrl(group.iconUrl)} alt="" className="h-full w-full rounded-[inherit] object-cover" />
            ) : (
              <span className="text-xs font-extrabold">{groupInitials(group.name)}</span>
            )}
          </RailItem>
        );
      })}
      <RailItem to="/groups?view=explore" label="Explorar o crear grupos" active={pathname === '/groups'} tone="action" onNavigate={onNavigate}>
        <Compass size={22} />
      </RailItem>
    </nav>
  );
};
