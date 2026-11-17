import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Flag } from 'lucide-react';
import { Modal } from '../common/Modal';
import { reportService } from '../../services/reportService';
import { ReportTargetType } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';

export interface ReportTarget {
  type: ReportTargetType;
  id: number;
  label: string;
}

interface ReportModalProps {
  target: ReportTarget | null;
  onClose: () => void;
}

interface ReportForm {
  reason: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ target, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReportForm>({ mode: 'onChange', defaultValues: { reason: '' } });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async ({ reason }: ReportForm) => {
    if (!target) return;
    try {
      await reportService.createReport({ targetType: target.type, targetId: target.id, reason: reason.trim() });
      toast.success('Gracias. El equipo de moderación revisará tu reporte.');
      close();
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={close}
      title={target?.type === 'USER' ? 'Reportar usuario' : 'Reportar material'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <p className="text-sm text-slate-600">
          Estás reportando <strong className="text-slate-900">{target?.type === 'USER' ? `@${target.label}` : target?.label}</strong>.
          Cuéntanos qué norma incumple; tu reporte es anónimo para la otra persona.
        </p>
        <div>
          <label htmlFor="report-reason" className="block text-xs font-semibold text-slate-700">
            Motivo
          </label>
          <textarea
            id="report-reason"
            rows={4}
            placeholder="Ej. El enlace lleva a contenido que no es académico."
            {...register('reason', {
              required: 'Cuéntanos el motivo del reporte',
              validate: (value) => {
                const length = value.trim().length;
                if (length < 10) return 'Escribe al menos 10 caracteres';
                if (length > 500) return 'Máximo 500 caracteres';
                return true;
              },
            })}
            className={inputClass(Boolean(errors.reason))}
          />
          {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Flag size={14} /> {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
