import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Flag, Megaphone, Scale, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useOpenReportsCount } from '../../hooks/useAdminReports';
import { UnreadBadge } from '../common/UnreadBadge';
import { adminService } from '../../services/adminService';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
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
    <nav aria-label="Secciones de administración" className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
      <NavLink to="/admin/overview" className={tabClass}>
        <BarChart3 size={15} /> Resumen
      </NavLink>
      <NavLink to="/admin/users" className={tabClass}>
        <Users size={15} /> Usuarios
      </NavLink>
      <NavLink to="/admin/reports" className={tabClass}>
        <Flag size={15} /> Reportes
        <UnreadBadge count={openReports} label={`${openReports} reportes pendientes`} />
      </NavLink>
      <NavLink to="/admin/appeals" className={tabClass}>
        <Scale size={15} /> Apelaciones
        <UnreadBadge count={pendingAppeals} label={`${pendingAppeals} apelaciones pendientes`} />
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin/announcements" className={tabClass}>
          <Megaphone size={15} /> Avisos
        </NavLink>
      )}
    </nav>
  );
};
