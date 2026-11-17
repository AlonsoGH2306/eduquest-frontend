import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bookmark,
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMyGroups } from '../../hooks/useMyGroups';
import { useNotifications } from '../../hooks/useNotifications';
import { useConversations } from '../../hooks/useConversations';
import { UserAvatar } from '../common/UserAvatar';
import { GlobalSearch } from './GlobalSearch';
import { UserPanel } from './UserPanel';

interface NavItem {
  to: string;
  label: string;
  Icon: React.ElementType;
  badge?: number;
}

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-2.5 py-2 text-[15px] font-semibold transition ${
    isActive ? 'bg-raised text-ink' : 'text-faint hover:bg-hover hover:text-soft'
  }`;

const Count: React.FC<{ value: number }> = ({ value }) =>
  value > 0 ? (
    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-chicle px-1 text-[11px] leading-none font-extrabold text-noche">
      {value > 99 ? '99+' : value}
    </span>
  ) : null;

interface SideNavProps {
  onNavigate?: () => void;
}

export const SideNav: React.FC<SideNavProps> = ({ onNavigate }) => {
  const { canManageUsers } = useAuth();
  const { totalUnread } = useMyGroups();
  const { unreadMessages } = useNotifications();
  const { conversations } = useConversations();

  const study: NavItem[] = [
    { to: '/dashboard', label: 'Inicio', Icon: LayoutDashboard },
    { to: '/documents', label: 'Biblioteca', Icon: FileText },
    { to: '/groups', label: 'Mis grupos', Icon: Users, badge: totalUnread },
    { to: '/forum', label: 'Foro', Icon: MessagesSquare },
    { to: '/study-planner', label: 'Plan de estudio', Icon: Sparkles },
    { to: '/calendar', label: 'Calendario', Icon: CalendarDays },
  ];
  const personal: NavItem[] = [
    { to: '/messages', label: 'Mensajes', Icon: MessageCircle, badge: unreadMessages },
    { to: '/saved', label: 'Guardados', Icon: Bookmark },
    { to: '/achievements', label: 'Logros', Icon: Trophy },
    ...(canManageUsers ? [{ to: '/admin', label: 'Administración', Icon: ShieldAlert }] : []),
  ];

  const renderItems = (items: NavItem[]) =>
    items.map(({ to, label, Icon, badge = 0 }) => (
      <NavLink key={to} to={to} end={to === '/groups'} className={itemClass} onClick={onNavigate}>
        <Icon size={20} className="shrink-0" />
        <span className="truncate">{label}</span>
        <Count value={badge} />
      </NavLink>
    ));

  return (
    <aside aria-label="Navegación" className="flex w-60 shrink-0 flex-col bg-side">
      <div className="flex h-14 shrink-0 items-center px-2.5 shadow-[0_1px_0_rgb(0_0_0/0.25)]">
        <div className="w-full">
          <GlobalSearch />
        </div>
      </div>

      <nav className="eq-scroll flex-1 space-y-0.5 overflow-y-auto px-2 pt-3 pb-2">
        {renderItems(study)}
        <div className="my-3 h-px bg-raised" />
        {renderItems(personal)}

        {conversations.length > 0 && (
          <>
            <p className="mt-5 mb-1 flex items-center px-2 text-xs font-semibold text-faint">Mensajes directos</p>
            {conversations.slice(0, 6).map((conversation) => (
              <NavLink
                key={conversation.partner.id}
                to={`/messages/${conversation.partner.id}`}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-2 py-1.5 transition ${
                    isActive ? 'bg-raised text-ink' : conversation.unreadCount > 0 ? 'text-ink hover:bg-hover' : 'text-faint hover:bg-hover hover:text-soft'
                  }`
                }
              >
                <UserAvatar username={conversation.partner.username} avatarUrl={conversation.partner.avatarUrl} size={32} />
                <span className={`truncate text-[15px] ${conversation.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                  {conversation.partner.username}
                </span>
                <Count value={conversation.unreadCount} />
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <UserPanel />
    </aside>
  );
};
