import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, CheckCircle2, Scale, XCircle } from 'lucide-react';
import { AppealStatus, BanAppeal } from '../types';
import { adminService } from '../services/adminService';
import { usePaginatedFetch } from '../hooks/usePaginatedFetch';
import { usePageParams } from '../hooks/usePageParams';
import { extractErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/formatDate';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { Spinner } from '../components/common/Spinner';
import { AdminHeader } from '../components/admin/AdminHeader';

const STATUS_OPTIONS: { value: AppealStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'ACCEPTED', label: 'Aceptadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
];

export const AdminAppealsPage: React.FC = () => {
  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const status = (STATUS_OPTIONS.find((option) => option.value === searchParams.get('status'))?.value ??
    'PENDING') as AppealStatus;
  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      adminService.getAppeals(status, pageNumber, pageSize, signal),
    [status]
  );
  const { items, totalElements, totalPages, loading, error, reload, setItems } = usePaginatedFetch(fetchPage, page, size);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const decide = async (appeal: BanAppeal, accepted: boolean) => {
    setBusyId(appeal.id);
    try {
      const updated = await adminService.decideAppeal(appeal.id, accepted, responses[appeal.id] ?? '');
      setItems((current) =>
        status === 'PENDING'
          ? current.filter((item) => item.id !== appeal.id)
          : current.map((item) => (item.id === appeal.id ? updated : item))
      );
      toast.success(accepted ? `Levantaste la suspensión de @${appeal.username}` : 'La suspensión se mantiene');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const renderList = () => {
    if (loading) return <Spinner label="Cargando apelaciones..." />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (items.length === 0) {
      return (
        <EmptyState
          title={status === 'PENDING' ? 'No hay apelaciones pendientes' : 'Sin apelaciones en esta lista'}
          description="Cuando un usuario suspendido apele, aparecerá aquí."
        />
      );
    }
    return (
      <>
        <ul className="space-y-3">
          {items.map((appeal) => (
            <li key={appeal.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">@{appeal.username}</h3>
                  <p className="text-xs text-slate-500">Apeló el {formatDateTime(appeal.createdAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <CalendarClock size={13} />
                  {appeal.bannedUntil ? `Suspendido hasta el ${formatDateTime(appeal.bannedUntil)}` : 'Veto permanente'}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Motivo de la suspensión: <span className="font-medium text-slate-700">{appeal.banReason ?? 'Sin detalle'}</span>
              </p>
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">{appeal.message}</p>

              {appeal.status === 'PENDING' ? (
                <div className="mt-4 space-y-2">
                  <label htmlFor={`appeal-response-${appeal.id}`} className="sr-only">
                    Respuesta para el usuario
                  </label>
                  <input
                    id={`appeal-response-${appeal.id}`}
                    value={responses[appeal.id] ?? ''}
                    maxLength={500}
                    onChange={(event) => setResponses((current) => ({ ...current, [appeal.id]: event.target.value }))}
                    placeholder="Respuesta opcional para el usuario"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busyId === appeal.id}
                      onClick={() => decide(appeal, false)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Rechazar
                    </button>
                    <button
                      type="button"
                      disabled={busyId === appeal.id}
                      onClick={() => decide(appeal, true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Aceptar y levantar suspensión
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">
                  {appeal.status === 'ACCEPTED' ? 'Aceptada' : 'Rechazada'} por @{appeal.reviewedBy} ·{' '}
                  {formatDateTime(appeal.reviewedAt)}
                  {appeal.response && <> · «{appeal.response}»</>}
                </p>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <PaginationBar
            page={page}
            size={size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={setPage}
            onSizeChange={setSize}
          />
        </div>
      </>
    );
  };

  return (
    <div>
      <AdminHeader
        section="Apelaciones"
        title="Apelaciones"
        description="Usuarios suspendidos o vetados que piden revisar su caso. Acepta para levantar la sanción o rechaza explicando por qué."
        icon={<Scale size={24} />}
      />
      <div className="mb-4 flex gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams({ status: option.value === 'PENDING' ? null : option.value, page: '0' })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              status === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {renderList()}
    </div>
  );
};
