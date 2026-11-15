import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, LayoutDashboard, LogOut, MessageCircle, ShieldAlert, Sparkles, Trophy, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserAvatar } from '../common/UserAvatar';
import { UnreadBadge } from '../common/UnreadBadge';
import { useMyGroups } from '../../hooks/useMyGroups';
import { useNotifications } from '../../hooks/useNotifications';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Inicio', Icon: LayoutDashboard },
  { to: '/documents', label: 'Biblioteca', shortLabel: 'Docs', Icon: FileText },
  { to: '/groups', label: 'Grupos', shortLabel: 'Grupos', Icon: Users },
  { to: '/messages', label: 'Mensajes', shortLabel: 'Chats', Icon: MessageCircle },
  { to: '/study-planner', label: 'Planificador', shortLabel: 'Plan', Icon: Sparkles },
  { to: '/achievements', label: 'Logros', shortLabel: 'Logros', Icon: Trophy },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export const Navbar: React.FC = () => {
  const { user, canManageUsers, roleName, logout } = useAuth();
  const { totalUnread } = useMyGroups();
  const { unreadMessages } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = canManageUsers
    ? [...LINKS, { to: '/admin', label: 'Administración', shortLabel: 'Admin', Icon: ShieldAlert }]
    : LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
            <BookOpen size={24} />
            <span>EduQuest</span>
          </NavLink>

          <nav aria-label="Navegación principal" className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={16} /> {label}
                {to === '/groups' && <UnreadBadge count={totalUnread} label={`${totalUnread} novedades en tus grupos`} />}
                {to === '/messages' && <UnreadBadge count={unreadMessages} label={`${unreadMessages} mensajes sin leer`} />}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          {user && (
            <NavLink
              to="/profile"
              className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:bg-slate-100"
              title="Mi perfil"
            >
              <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold text-slate-800">{user.username}</span>
                <span className="block text-[11px] text-slate-500">{roleName}</span>
              </span>
            </NavLink>
          )}
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
            {to === '/messages' && <UnreadBadge count={unreadMessages} />}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};
