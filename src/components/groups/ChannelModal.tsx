import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Hash, Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ChannelSettings, GroupChannel } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';

interface ChannelModalProps {
  isOpen: boolean;
  channel: GroupChannel | null;
  onClose: () => void;
  onSave: (settings: ChannelSettings) => Promise<unknown>;
}

interface FormValues {
  name: string;
  topic: string;
  readOnly: boolean;
  slowModeSeconds: string;
}

const SLOW_MODE_OPTIONS = [
  { value: '0', label: 'Desactivado' },
  { value: '5', label: '5 segundos' },
  { value: '10', label: '10 segundos' },
  { value: '30', label: '30 segundos' },
  { value: '60', label: '1 minuto' },
  { value: '300', label: '5 minutos' },
  { value: '900', label: '15 minutos' },
];

export const ChannelModal: React.FC<ChannelModalProps> = ({ isOpen, channel, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange' });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: channel?.name ?? '',
        topic: channel?.topic ?? '',
        readOnly: channel?.readOnly ?? false,
        slowModeSeconds: String(channel?.slowModeSeconds ?? 0),
      });
    }
  }, [isOpen, channel, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await onSave({
        name: values.name.trim(),
        topic: values.topic.trim() || undefined,
        readOnly: values.readOnly,
        slowModeSeconds: Number(values.slowModeSeconds),
      });
      toast.success(channel ? 'Canal actualizado' : 'Canal creado');
      onClose();
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={channel ? 'Editar canal' : 'Nuevo canal'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="channel-name" className="block text-xs font-semibold text-slate-700">
            Nombre del canal
          </label>
          <div className="relative">
            <Hash size={14} className="absolute top-1/2 left-3 mt-0.5 -translate-y-1/2 text-slate-400" />
            <input
              id="channel-name"
              maxLength={40}
              placeholder="dudas-parcial"
              className={`${inputClass(Boolean(errors.name))} pl-8`}
              {...register('name', {
                validate: (value) => value.trim().length >= 2 || 'El nombre debe tener al menos 2 caracteres',
              })}
            />
          </div>
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500">Se guarda en minúsculas y con guiones.</p>
          )}
        </div>
        <div>
          <label htmlFor="channel-topic" className="block text-xs font-semibold text-slate-700">
            Tema (opcional)
          </label>
          <input
            id="channel-topic"
            maxLength={200}
            placeholder="¿De qué se habla aquí?"
            className={inputClass(Boolean(errors.topic))}
            {...register('topic')}
          />
          {errors.topic && <p className="mt-1 text-xs text-red-600">{errors.topic.message}</p>}
        </div>
        <label className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700">
          <input type="checkbox" className="mt-0.5" {...register('readOnly')} />
          <span>
            <span className="block font-semibold">Canal de anuncios</span>
            Solo el creador y los moderadores pueden escribir; los demás leen y reaccionan.
          </span>
        </label>
        <div>
          <label htmlFor="channel-slow" className="block text-xs font-semibold text-slate-700">
            Modo lento
          </label>
          <select id="channel-slow" className={inputClass(false)} {...register('slowModeSeconds')}>
            {SLOW_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">Tiempo mínimo entre mensajes de una misma persona.</p>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={14} /> {isSubmitting ? 'Guardando...' : channel ? 'Guardar cambios' : 'Crear canal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
