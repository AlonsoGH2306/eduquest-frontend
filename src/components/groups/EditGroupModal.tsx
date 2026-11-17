import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GroupResponse, GroupUpdateRequest } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';

interface EditGroupModalProps {
  group: GroupResponse | null;
  onClose: () => void;
  onSave: (payload: GroupUpdateRequest) => Promise<unknown>;
}

interface FormValues {
  name: string;
  description: string;
}

const DESCRIPTION_MAX = 500;

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange' });

  useEffect(() => {
    if (group) reset({ name: group.name, description: group.description ?? '' });
  }, [group, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      await onSave({ name: values.name.trim(), description: values.description.trim() || undefined });
      toast.success('Grupo actualizado');
      onClose();
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={group !== null} onClose={onClose} title="Editar grupo">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="group-name" className="block text-xs font-semibold text-slate-700">
            Nombre del grupo
          </label>
          <input
            id="group-name"
            maxLength={100}
            className={inputClass(Boolean(errors.name))}
            {...register('name', {
              validate: (value) => value.trim().length > 0 || 'El nombre del grupo es obligatorio',
            })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="group-description" className="block text-xs font-semibold text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            id="group-description"
            rows={3}
            maxLength={DESCRIPTION_MAX}
            className={inputClass(Boolean(errors.description))}
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
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
            <Save size={14} /> {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
