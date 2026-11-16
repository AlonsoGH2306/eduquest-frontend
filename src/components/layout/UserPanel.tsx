import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { StatusMenu } from './StatusMenu';
import { ThemeToggle } from './ThemeToggle';

export const UserPanel: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="m-2 flex shrink-0 items-center gap-0.5 rounded-xl bg-panel px-2 py-1.5">
      <StatusMenu />
      <NotificationBell />
      <ThemeToggle />
      <button
        type="button"
        onClick={handleLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="flex h-8 w-8 items-center justify-center rounded-md text-soft transition hover:bg-hover hover:text-red-500"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
};
