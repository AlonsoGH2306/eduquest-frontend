import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Flag, Megaphone, Scale, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOpenReportsCount } from '../../hooks/useAdminReports';
import { UnreadBadge } from '../common/UnreadBadge';
import { adminService } from '../../services/adminService';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
    isActive ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
  }`;

export const AdminTabs: React.FC = () => {
  const openReports = useOpenReportsCount();
  const [pendingAppeals, setPendingAppeals] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    adminService
      .countPendingAppeals(controller.signal)
      .then(setPendingAppeals)
      .catch(() => setPendingAppeals(0));
    return () => controller.abort();
  }, []);
  const { isAdmin } = useAuth();

  return (
    <nav aria-label="Secciones de administración" className="mb-6 flex gap-1 border-b border-slate-200">
      <NavLink to="/admin/overview" className={tabClass}>
        <BarChart3 size={14} /> Resumen
      </NavLink>
      <NavLink to="/admin/users" className={tabClass}>
        <Users size={14} /> Usuarios
      </NavLink>
      <NavLink to="/admin/reports" className={tabClass}>
        <Flag size={14} /> Reportes
        <UnreadBadge count={openReports} label={`${openReports} reportes pendientes`} />
      </NavLink>
      <NavLink to="/admin/appeals" className={tabClass}>
        <Scale size={14} /> Apelaciones
        <UnreadBadge count={pendingAppeals} label={`${pendingAppeals} apelaciones pendientes`} />
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin/announcements" className={tabClass}>
          <Megaphone size={14} /> Avisos
        </NavLink>
      )}
    </nav>
  );
};
