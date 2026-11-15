import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Globe, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GroupRequest, GroupResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';
import { PasswordInput } from '../common/PasswordInput';

interface CreateGroupForm extends GroupRequest {
  confirmPassword: string;
}

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Público', hint: 'Aparece en la lista', Icon: Globe },
  { value: 'PRIVATE', label: 'Privado', hint: 'Código y contraseña', Icon: Lock },
] as const;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: GroupRequest) => Promise<GroupResponse>;
  onCreated: (group: GroupResponse) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onCreate, onCreated }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<CreateGroupForm>({
    mode: 'onChange',
    defaultValues: { name: '', description: '', visibility: 'PUBLIC', password: '', confirmPassword: '' },
  });
  const visibility = watch('visibility');
  const password = watch('password');

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: CreateGroupForm) => {
    try {
      const created = await onCreate({
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        visibility: values.visibility,
        password: values.visibility === 'PRIVATE' ? values.password : undefined,
      });
      toast.success(`Grupo "${created.name}" creado`);
      reset();
      onCreated(created);
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Crear grupo de estudio">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="group-name" className="block text-xs font-semibold text-slate-700">
            Nombre del grupo
          </label>
          <input
            id="group-name"
            type="text"
            placeholder="Ej. DBP 2026-2 - Equipo del proyecto"
            {...register('name', {
              required: 'El nombre del grupo es obligatorio',
              validate: (value) => value.trim().length > 0 || 'El nombre del grupo es obligatorio',
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
            })}
            className={inputClass(Boolean(errors.name))}
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
            placeholder="Objetivos del grupo, horario de reuniones..."
            {...register('description')}
            className={inputClass(false)}
          />
        </div>

        <fieldset>
          <legend className="block text-xs font-semibold text-slate-700">¿Quién puede entrar?</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {VISIBILITY_OPTIONS.map(({ value, label, hint, Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                  visibility === value
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input type="radio" value={value} {...register('visibility')} className="sr-only" />
                <Icon size={16} />
                <span>
                  <span className="block text-xs font-semibold">{label}</span>
                  <span className="block text-[11px] text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {visibility === 'PRIVATE' && (
          <div>
            <label htmlFor="group-password" className="block text-xs font-semibold text-slate-700">
              Contraseña de ingreso
            </label>
            <PasswordInput
              id="group-password"
              autoComplete="new-password"
              placeholder="Compártela solo con tus invitados"
              {...register('password', {
                validate: (value) => {
                  if (visibility !== 'PRIVATE') return true;
                  if (!value) return 'Un grupo privado necesita contraseña';
                  if (value.length < 4) return 'Usa al menos 4 caracteres';
                  if (value.length > 50) return 'Máximo 50 caracteres';
                  return true;
                },
                onChange: () => {
                  if (touchedFields.confirmPassword) void trigger('confirmPassword');
                },
              })}
              hasError={Boolean(errors.password)}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Solo entrará quien tenga el código y esta contraseña.</p>
            )}

            <label htmlFor="group-password-confirm" className="mt-3 block text-xs font-semibold text-slate-700">
              Confirmar contraseña
            </label>
            <PasswordInput
              id="group-password-confirm"
              autoComplete="new-password"
              placeholder="Vuelve a escribirla"
              {...register('confirmPassword', {
                validate: (value) =>
                  visibility !== 'PRIVATE' || value === password || 'Las contraseñas no coinciden',
              })}
              hasError={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
