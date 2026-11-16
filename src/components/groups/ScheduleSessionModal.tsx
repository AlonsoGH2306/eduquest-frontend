import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarPlus, Save, Video, Wand2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { generateJitsiLink } from '../../utils/meetingLinks';
import { StudySessionRequest, StudySessionResponse } from '../../types';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (payload: StudySessionRequest) => Promise<void>;
  session?: StudySessionResponse | null;
}

interface SessionForm {
  title: string;
  description: string;
  scheduledAt: string;
  endTime: string;
  meetingUrl: string;
}

const EMPTY: SessionForm = { title: '', description: '', scheduledAt: '', endTime: '', meetingUrl: '' };

const timeOf = (value: string) => value.slice(11, 16);

const addMinutes = (time: string, minutes: number) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = Math.min(hours * 60 + mins + minutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
  session,
}) => {
  const isEditing = Boolean(session);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SessionForm>({ mode: 'onChange', defaultValues: EMPTY });
  const scheduledAt = watch('scheduledAt');

  useEffect(() => {
    if (!isOpen) return;
    reset(
      session
        ? {
            title: session.title,
            description: session.description ?? '',
            scheduledAt: session.scheduledAt.slice(0, 16),
            endTime: timeOf(session.endsAt),
            meetingUrl: session.meetingUrl ?? '',
          }
        : EMPTY
    );
  }, [isOpen, session, reset]);

  const onSubmit = async (values: SessionForm) => {
    const start = values.scheduledAt.slice(0, 16);

    try {
      await onSchedule({
        title: values.title.trim(),
        description: values.description?.trim() || '',
        scheduledAt: `${start}:00`,
        endsAt: `${start.slice(0, 10)}T${values.endTime}:00`,
        meetingUrl: values.meetingUrl.trim(),
      });
      reset();
      onClose();
    } catch {
      return;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Sesión de Estudio' : 'Agendar Sesión de Estudio'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Título de la sesión</label>
          <input
            type="text"
            placeholder="Ej. Repaso Final de Base de Datos"
            {...register('title', {
              required: 'El título es obligatorio',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Descripción / Temas</label>
          <textarea
            rows={2}
            placeholder="Resolveremos exámenes pasados..."
            {...register('description')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_9rem]">
          <div>
            <label htmlFor="session-start" className="block text-xs font-semibold text-slate-700">
              Fecha y hora de inicio
            </label>
            <input
              id="session-start"
              type="datetime-local"
              {...register('scheduledAt', {
                required: 'Selecciona la fecha y hora de la sesión',
                validate: (value) => new Date(value).getTime() > Date.now() || 'Elige una fecha y hora futura',
                onChange: (event) => {
                  const start = timeOf(event.target.value);
                  if (start && !getValues('endTime')) setValue('endTime', addMinutes(start, 60));
                },
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.scheduledAt && <p className="mt-1 text-xs text-red-600">{errors.scheduledAt.message}</p>}
          </div>
          <div>
            <label htmlFor="session-end" className="block text-xs font-semibold text-slate-700">
              Hora de fin
            </label>
            <input
              id="session-end"
              type="time"
              {...register('endTime', {
                required: 'Indica la hora de fin',
                validate: (value) =>
                  !scheduledAt || value > timeOf(scheduledAt) || 'Debe ser después de la hora de inicio',
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime.message}</p>}
          </div>
        </div>
        <p className="-mt-2 text-[11px] text-slate-500">
          Los asistentes podrán marcar su asistencia con «Unirme ahora» desde 10 minutos antes del inicio hasta la hora de fin.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Enlace de Videollamada (Meet, Zoom, Discord)
          </label>
          <input
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij"
            {...register('meetingUrl', {
              validate: (value) => Boolean(value?.trim()) || 'Pega el enlace de la llamada para que todos puedan entrar',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'El enlace debe comenzar con http:// o https://',
              },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.meetingUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.meetingUrl.message}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() =>
                setValue('meetingUrl', generateJitsiLink(getValues('title')), { shouldValidate: true, shouldDirty: true })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Wand2 size={13} /> Generar enlace de videollamada
            </button>
            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-700"
            >
              <Video size={13} /> o crear un Meet
            </a>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            El enlace generado usa Jitsi Meet: gratis, sin cuenta y funciona desde el navegador o el celular.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isEditing ? <Save size={14} /> : <CalendarPlus size={14} />}
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Programar Sesión'}
          </button>
        </div>
      </form>
    </Modal>
  );
};