import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, FileText, Flag, ShieldCheck, Trash2, User, UserX, XCircle } from 'lucide-react';
import { ReportResponse, ReportStatus, UserResponse } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAdminReports } from '../hooks/useAdminReports';
import { usePageParams } from '../hooks/usePageParams';
import { extractErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/formatDate';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { Spinner } from '../components/common/Spinner';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { BanUserModal } from '../components/admin/BanUserModal';
import { AdminTabs } from '../components/admin/AdminTabs';

const STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: 'OPEN', label: 'Pendientes' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'DISMISSED', label: 'Descartados' },
];

export const AdminReportsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const status = (STATUS_OPTIONS.find((option) => option.value === searchParams.get('status'))?.value ?? 'OPEN') as ReportStatus;
  const { reports, totalElements, totalPages, loading, error, reload, closeReport, deleteDocument, banUser } = useAdminReports(
    status,
    page,
    size
  );

  const [busyId, setBusyId] = useState<number | null>(null);
  const [banTarget, setBanTarget] = useState<{ report: ReportResponse; user: UserResponse } | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<ReportResponse | null>(null);

  const close = async (report: ReportResponse, newStatus: 'RESOLVED' | 'DISMISSED', message: string) => {
    setBusyId(report.id);
    try {
      await closeReport(report, newStatus);
      toast.success(message);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (user: UserResponse, reason: string) => {
    if (!banTarget) return;
    setBusyId(banTarget.report.id);
    try {
      await banUser(user.id, reason);
      await closeReport(banTarget.report, 'RESOLVED');
      toast.success(`@${user.username} fue vetado y el reporte quedó resuelto`);
      setBanTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    setBusyId(documentToDelete.id);
    try {
      await deleteDocument(documentToDelete.targetId);
      await closeReport(documentToDelete, 'RESOLVED');
      toast.success('Material eliminado y reporte resuelto');
      setDocumentToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const renderReports = () => {
    if (loading) return <Spinner label="Cargando reportes..." />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (reports.length === 0) {
      return (
        <EmptyState
          title={status === 'OPEN' ? 'No hay reportes pendientes' : 'Sin reportes en esta lista'}
          description={status === 'OPEN' ? 'La comunidad está en orden. ¡Buen trabajo!' : 'Aquí verás el historial de moderación.'}
        />
      );
    }
    return (
      <>
        <ul className="space-y-3">
          {reports.map((report) => {
            const isUser = report.targetType === 'USER';
            const busy = busyId === report.id;
            return (
              <li key={report.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isUser ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {isUser ? <User size={12} /> : <FileText size={12} />} {isUser ? 'Usuario' : 'Material'}
                    </span>
                    <h3 className="mt-1.5 truncate text-base font-bold text-slate-900">
                      {isUser ? `@${report.targetLabel}` : report.targetLabel}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Reportado por @{report.reporterUsername} · {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                  {report.status !== 'OPEN' && (
                    <span className="text-xs text-slate-500">
                      {report.status === 'RESOLVED' ? 'Resuelto' : 'Descartado'} por @{report.resolvedByUsername} ·{' '}
                      {formatDateTime(report.resolvedAt)}
                    </span>
                  )}
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{report.reason}</p>

                {report.status === 'OPEN' && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => close(report, 'DISMISSED', 'Reporte descartado')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Descartar
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => close(report, 'RESOLVED', 'Reporte marcado como resuelto')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Marcar resuelto
                    </button>
                    {isAdmin && isUser && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setBanTarget({
                            report,
                            user: { id: report.targetId, username: report.targetLabel ?? '', email: '', roles: [] },
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <UserX size={14} /> Vetar usuario
                      </button>
                    )}
                    {isAdmin && !isUser && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setDocumentToDelete(report)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Eliminar material
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
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
      <Breadcrumbs items={[{ label: 'Administración', to: '/admin/users' }, { label: 'Reportes' }]} />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <ShieldCheck size={24} className="text-indigo-600" /> Moderación
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Revisa lo que reporta la comunidad.{' '}
          {isAdmin ? 'Puedes vetar usuarios o eliminar materiales.' : 'Como manager puedes resolver o descartar reportes.'}
        </p>
      </div>

      <AdminTabs />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={status === option.value}
            onClick={() => updateParams({ status: option.value === 'OPEN' ? null : option.value, page: '0' })}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              status === option.value ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.value === 'OPEN' && <Flag size={12} />} {option.label}
          </button>
        ))}
      </div>

      {renderReports()}

      <BanUserModal
        user={banTarget?.user ?? null}
        saving={busyId !== null}
        onConfirm={handleBan}
        onClose={() => setBanTarget(null)}
      />

      <ConfirmModal
        isOpen={documentToDelete !== null}
        title="Eliminar material"
        message={
          <>
            «<span className="font-semibold text-slate-900">{documentToDelete?.targetLabel}</span>» y sus reseñas se
            borrarán para todos. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        destructive
        loading={busyId !== null}
        icon={<Trash2 size={14} />}
        onConfirm={handleDeleteDocument}
        onClose={() => setDocumentToDelete(null)}
      />
    </div>
  );
};
