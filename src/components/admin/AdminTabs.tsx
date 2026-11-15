import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flag, Megaphone, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOpenReportsCount } from '../../hooks/useAdminReports';
import { UnreadBadge } from '../common/UnreadBadge';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
    isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
  }`;

export const AdminTabs: React.FC = () => {
  const openReports = useOpenReportsCount();
  const { isAdmin } = useAuth();

  return (
    <nav aria-label="Secciones de administración" className="mb-6 flex gap-1 border-b border-slate-200">
      <NavLink to="/admin/users" className={tabClass}>
        <Users size={14} /> Usuarios
      </NavLink>
      <NavLink to="/admin/reports" className={tabClass}>
        <Flag size={14} /> Reportes
        <UnreadBadge count={openReports} label={`${openReports} reportes pendientes`} />
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin/announcements" className={tabClass}>
          <Megaphone size={14} /> Avisos
        </NavLink>
      )}
    </nav>
  );
};
