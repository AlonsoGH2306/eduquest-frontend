import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Check, Globe, Lock, Plus, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GroupRequest, GroupResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';
import { PasswordInput } from '../common/PasswordInput';
import { GROUP_COLORS } from '../../utils/groupAvatar';
import { GroupAvatar } from './GroupAvatar';
import { groupService } from '../../services/groupService';
import { documentService } from '../../services/documentService';
import { GROUP_IMAGE_ACCEPT, groupImageError } from '../../utils/groupImage';

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
    defaultValues: { name: '', description: '', visibility: 'PUBLIC', password: '', confirmPassword: '', color: GROUP_COLORS[0] },
  });
  const visibility = watch('visibility');
  const password = watch('password');
  const color = watch('color') ?? GROUP_COLORS[0];
  const name = watch('name');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const iconInput = useRef<HTMLInputElement>(null);

  const uploadIcon = async (file: File | undefined) => {
    if (!file) return;
    const invalid = groupImageError(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(true);
    try {
      const { url } = await documentService.uploadFile(file);
      setIconUrl(url);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const close = () => {
    reset();
    setIconUrl(null);
    onClose();
  };

  const onSubmit = async (values: CreateGroupForm) => {
    try {
      const created = await onCreate({
        name: values.name.trim(),
        description: values.description?.trim() ?? '',
        visibility: values.visibility,
        password: values.visibility === 'PRIVATE' ? values.password : undefined,
        color: values.color,
      });
      let result = created;
      if (iconUrl) {
        try {
          result = await groupService.updateAppearance(created.id, { color: values.color ?? null, iconUrl, bannerUrl: null });
        } catch (error) {
          toast.error(`El grupo se creó, pero no se pudo guardar la foto: ${extractErrorMessage(error)}`);
        }
      }
      toast.success(`Grupo "${created.name}" creado`);
      reset();
      setIconUrl(null);
      onCreated(result);
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Crear grupo de estudio">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => iconInput.current?.click()}
              disabled={uploading}
              aria-label={iconUrl ? 'Cambiar la foto del grupo' : 'Subir una foto del grupo'}
              className="relative block disabled:opacity-60"
            >
              <GroupAvatar group={{ name: name.trim() || 'Nuevo grupo', color, iconUrl }} size={72} radius={24} />
              <span className="absolute -right-1.5 -bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white ring-4 ring-[var(--eq-raised)]">
                <Plus size={14} />
              </span>
            </button>
            {iconUrl && (
              <button
                type="button"
                onClick={() => setIconUrl(null)}
                aria-label="Quitar la foto"
                className="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white ring-2 ring-[var(--eq-raised)] hover:bg-red-500"
              >
                <X size={12} />
              </button>
            )}
            <input
              ref={iconInput}
              type="file"
              accept={GROUP_IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => {
                void uploadIcon(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
          <fieldset className="min-w-0">
            <legend className="text-sm font-bold text-slate-900">Foto y color del grupo</legend>
            <p className="text-xs text-slate-500">
              {uploading ? 'Subiendo foto...' : iconUrl ? 'El color se usa en la portada.' : 'Toca el ícono para subir una foto, o elige un color.'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GROUP_COLORS.map((option) => (
                <label
                  key={option}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-noche transition ${
                    color === option ? 'ring-2 ring-ink ring-offset-2 ring-offset-[var(--eq-raised)]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: option }}
                >
                  <input type="radio" value={option} {...register('color')} className="sr-only" aria-label={`Color ${option}`} />
                  {color === option && <Check size={16} />}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div>
          <label htmlFor="group-name" className="block text-sm font-bold text-slate-800">
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
          <label htmlFor="group-description" className="block text-sm font-bold text-slate-800">
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
          <legend className="block text-sm font-bold text-slate-800">¿Quién puede entrar?</legend>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {VISIBILITY_OPTIONS.map(({ value, label, hint, Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-3.5 py-3 transition ${
                  visibility === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input type="radio" value={value} {...register('visibility')} className="sr-only" />
                <Icon size={16} />
                <span>
                  <span className="block text-sm font-bold">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {visibility === 'PRIVATE' && (
          <div>
            <label htmlFor="group-password" className="block text-sm font-bold text-slate-800">
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

            <label htmlFor="group-password-confirm" className="mt-3 block text-sm font-bold text-slate-800">
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
            className="h-11 rounded-full px-5 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="h-11 rounded-full bg-indigo-600 px-6 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
