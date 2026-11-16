import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, CalendarDays, FileText, LayoutDashboard, LogOut, MessageCircle, MessagesSquare, ShieldAlert, Sparkles, Trophy, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UnreadBadge } from '../common/UnreadBadge';
import { useMyGroups } from '../../hooks/useMyGroups';
import { useNotifications } from '../../hooks/useNotifications';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';
import { StatusMenu } from './StatusMenu';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Inicio', Icon: LayoutDashboard },
  { to: '/documents', label: 'Biblioteca', shortLabel: 'Docs', Icon: FileText },
  { to: '/groups', label: 'Grupos', shortLabel: 'Grupos', Icon: Users },
  { to: '/forum', label: 'Foro', shortLabel: 'Foro', Icon: MessagesSquare },
  { to: '/study-planner', label: 'Planificador', shortLabel: 'Plan', Icon: Sparkles },
  { to: '/achievements', label: 'Logros', shortLabel: 'Logros', Icon: Trophy },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition ${
    isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export const Navbar: React.FC = () => {
  const { canManageUsers, logout } = useAuth();
  const { totalUnread } = useMyGroups();
  const { unreadMessages } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = canManageUsers
    ? [...LINKS, { to: '/admin', label: 'Admin', shortLabel: 'Admin', Icon: ShieldAlert }]
    : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 xl:gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <BookOpen size={24} />
            <span>EduQuest</span>
          </NavLink>

          <nav aria-label="Navegación principal" className="hidden items-center gap-0.5 md:flex">
            {links.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass} title={label} aria-label={label}>
                <Icon size={16} />
                <span className="hidden xl:inline">{label}</span>
                {to === '/groups' && <UnreadBadge count={totalUnread} label={`${totalUnread} novedades en tus grupos`} />}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <GlobalSearch />
          <ThemeToggle />
          <NotificationBell />
          <NavLink
            to="/calendar"
            title="Mi calendario"
            aria-label="Mi calendario"
            className={({ isActive }) =>
              `flex h-9 w-9 items-center justify-center rounded-lg transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <CalendarDays size={18} />
          </NavLink>
          <NavLink
            to="/messages"
            title="Mensajes"
            aria-label={unreadMessages > 0 ? `Mensajes, ${unreadMessages} sin leer` : 'Mensajes'}
            className={({ isActive }) =>
              `relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <MessageCircle size={18} />
            {unreadMessages > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] leading-none font-bold text-white">
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
          </NavLink>
          <StatusMenu />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegación móvil"
        className="flex items-center justify-around overflow-x-auto border-t border-slate-100 px-2 py-1.5 md:hidden"
      >
        {links.map(({ to, shortLabel, Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={15} /> {shortLabel}
            {to === '/groups' && <UnreadBadge count={totalUnread} />}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
