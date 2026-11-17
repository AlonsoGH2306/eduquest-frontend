import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { TriangleAlert, UserCheck, Users, UserX } from 'lucide-react';
import { UserResponse } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { usePageParams } from '../hooks/usePageParams';
import { extractErrorMessage } from '../utils/errors';
import { primaryRole, ROLE_OPTIONS, roleLabel } from '../utils/roles';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { Spinner } from '../components/common/Spinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { UserAvatar } from '../components/common/UserAvatar';
import { BanUserModal } from '../components/admin/BanUserModal';
import { WarnUserModal } from '../components/admin/WarnUserModal';
import { adminService } from '../services/adminService';
import { AdminHeader } from '../components/admin/AdminHeader';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { page, size, setPage, setSize } = usePageParams();
  const { users, totalElements, totalPages, loading, error, reload, changeRole, banUser, unbanUser } = useAdminUsers(
    page,
    size
  );

  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toBan, setToBan] = useState<UserResponse | null>(null);
  const [toUnban, setToUnban] = useState<UserResponse | null>(null);
  const [toWarn, setToWarn] = useState<UserResponse | null>(null);
  const [moderating, setModerating] = useState(false);

  const canModerate = (user: UserResponse) =>
    user.id !== currentUser?.id &&
    !user.roles.includes('ROLE_ADMIN') &&
    (isAdmin || !user.roles.includes('ROLE_MANAGER'));

  const formatUntil = (value: string) =>
    new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleRoleChange = async (user: UserResponse, role: string) => {
    if (primaryRole(user.roles) === role) return;
    setUpdatingId(user.id);
    try {
      const updated = await changeRole(user.id, role);
      toast.success(`@${updated.username} ahora es ${roleLabel(updated.roles).toLowerCase()}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWarn = async (user: UserResponse, message: string) => {
    setModerating(true);
    try {
      await adminService.warnUser(user.id, message);
      toast.success(`Advertencia enviada a @${user.username}`);
      setToWarn(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setModerating(false);
    }
  };

  const handleBan = async (user: UserResponse, reason: string, days: number | null) => {
    setModerating(true);
    try {
      await banUser(user.id, reason, days);
      toast.success(
        days === null ? `@${user.username} fue vetado` : `@${user.username} quedó suspendido ${days} ${days === 1 ? 'día' : 'días'}`
      );
      setToBan(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setModerating(false);
    }
  };

  const handleUnban = async () => {
    if (!toUnban) return;
    setModerating(true);
    try {
      await unbanUser(toUnban.id);
      toast.success(`@${toUnban.username} puede volver a usar EduQuest`);
      setToUnban(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setModerating(false);
    }
  };

  const renderTable = () => {
    if (loading) return <Spinner label="Cargando usuarios..." />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (users.length === 0) {
      return <EmptyState title="No hay usuarios registrados" description="Cuando existan cuentas en la plataforma, aparecerán aquí." />;
    }
    return (
      <>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Usuario</th>
                <th scope="col" className="px-4 py-3">Correo</th>
                <th scope="col" className="px-4 py-3">Rol</th>
                <th scope="col" className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className={user.banned ? 'bg-red-50/40' : 'hover:bg-slate-50/70'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
                      <span className="font-semibold text-slate-800">
                        @{user.username}
                        {user.id === currentUser?.id && <span className="font-normal text-slate-400"> (tú)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin && user.id !== currentUser?.id ? (
                      <select
                        value={primaryRole(user.roles)}
                        disabled={updatingId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        aria-label={`Rol de ${user.username}`}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                        {roleLabel(user.roles)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      {user.banned ? (
                        <span
                          title={user.banReason ?? undefined}
                          className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700"
                        >
                          {user.bannedUntil ? `Suspendido hasta ${formatUntil(user.bannedUntil)}` : 'Vetado'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Activo
                        </span>
                      )}
                      {user.banned && user.banReason && (
                        <span className="max-w-48 truncate text-[11px] text-slate-500" title={user.banReason}>
                          {user.banReason}
                        </span>
                      )}
                      {canModerate(user) &&
                        (user.banned ? (
                          <button
                            type="button"
                            onClick={() => setToUnban(user)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <UserCheck size={13} /> {user.bannedUntil ? 'Levantar suspensión' : 'Quitar veto'}
                          </button>
                        ) : (
                          <span className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setToWarn(user)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-800"
                            >
                              <TriangleAlert size={13} /> Advertir
                            </button>
                            <button
                              type="button"
                              onClick={() => setToBan(user)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800"
                            >
                              <UserX size={13} /> Suspender
                            </button>
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={setPage}
          onSizeChange={setSize}
        />
      </>
    );
  };

  return (
    <div>
      <AdminHeader
        section="Usuarios"
        title="Usuarios"
        description={
          isAdmin
            ? 'Consulta las cuentas registradas, actualiza su rol y veta a quienes incumplan las normas.'
            : 'Como gestor puedes advertir y suspender estudiantes hasta 7 días. Solo un administrador cambia roles o veta para siempre.'
        }
        icon={<Users size={24} />}
        aside={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white">
            <Users size={15} /> {totalElements} usuarios
          </span>
        }
      />

      {renderTable()}

      <BanUserModal
        user={toBan}
        saving={moderating}
        allowPermanent={isAdmin}
        onConfirm={handleBan}
        onClose={() => setToBan(null)}
      />

      <WarnUserModal user={toWarn} saving={moderating} onConfirm={handleWarn} onClose={() => setToWarn(null)} />

      <ConfirmModal
        isOpen={toUnban !== null}
        title={`Devolver el acceso a @${toUnban?.username ?? ''}`}
        message="Podrá volver a iniciar sesión y usar EduQuest con normalidad."
        confirmLabel="Devolver acceso"
        loadingLabel="Guardando..."
        loading={moderating}
        icon={<UserCheck size={14} />}
        onConfirm={handleUnban}
        onClose={() => setToUnban(null)}
      />
    </div>
  );
};
