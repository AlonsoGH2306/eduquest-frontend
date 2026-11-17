import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, CalendarDays, FileText, Flag, ShieldCheck, UserPlus, Users, UserX } from 'lucide-react';
import { adminService } from '../services/adminService';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { ErrorState } from '../components/common/ErrorState';
import { AdminHeader } from '../components/admin/AdminHeader';

interface Metric {
  label: string;
  value: number;
  hint?: string;
  Icon: React.ElementType;
  tone: string;
  to?: string;
}

export const AdminOverviewPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const fetchStats = useCallback((signal: AbortSignal) => adminService.getStats(signal), []);
  const { data: stats, loading, error, reload } = useFetch(fetchStats);

  const metrics: Metric[] = stats
    ? [
        { label: 'Usuarios registrados', value: stats.users, hint: `${stats.newUsersThisWeek} nuevos esta semana`, Icon: Users, tone: 'bg-indigo-50 text-indigo-600', to: '/admin/users' },
        { label: 'Nuevos esta semana', value: stats.newUsersThisWeek, Icon: UserPlus, tone: 'bg-sky-50 text-sky-700' },
        { label: 'Cuentas suspendidas', value: stats.suspendedUsers, Icon: UserX, tone: 'bg-red-50 text-red-600', to: '/admin/users' },
        { label: 'Reportes pendientes', value: stats.openReports, Icon: Flag, tone: 'bg-amber-50 text-amber-700', to: '/admin/reports' },
        { label: 'Materiales', value: stats.documents, hint: `${stats.documentsThisWeek} subidos esta semana`, Icon: FileText, tone: 'bg-violet-50 text-violet-700', to: '/documents' },
        { label: 'Grupos de estudio', value: stats.groups, Icon: Users, tone: 'bg-emerald-50 text-emerald-700', to: '/groups?view=explore' },
        { label: 'Sesiones agendadas esta semana', value: stats.sessionsThisWeek, Icon: CalendarDays, tone: 'bg-rose-50 text-rose-700' },
      ]
    : [];

  return (
    <div>
      <AdminHeader
        section="Resumen"
        title={isAdmin ? 'Administración' : 'Moderación'}
        description="Cómo va la comunidad de EduQuest esta semana."
        icon={<ShieldCheck size={24} />}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading && !stats
            ? Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
              ))
            : metrics.map(({ label, value, hint, Icon, tone, to }) => {
                const content = (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{label}</span>
                      <span className={`rounded-xl p-2 ${tone}`}>
                        <Icon size={16} />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
                    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
                  </>
                );
                const className = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-xs';
                return to ? (
                  <Link key={label} to={to} className={`${className} transition hover:border-indigo-200 hover:shadow-md`}>
                    {content}
                  </Link>
                ) : (
                  <div key={label} className={className}>
                    {content}
                  </div>
                );
              })}
        </div>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-xs text-slate-500">
        <BarChart3 size={13} /> Los datos se actualizan cada vez que abres esta página.
      </p>
    </div>
  );
};
