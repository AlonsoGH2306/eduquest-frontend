import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Check, Copy, KeyRound, Link2, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { PasswordInput } from '../common/PasswordInput';
import { Spinner } from '../common/Spinner';
import { groupService } from '../../services/groupService';
import { GroupInvite, GroupResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors } from '../../utils/forms';
import { formatDateTime } from '../../utils/formatDate';
import { buildInviteLink } from '../../utils/invites';

interface InviteModalProps {
  group: GroupResponse | null;
  onClose: () => void;
}

interface PasswordForm {
  password: string;
  confirmPassword: string;
}

const copyText = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error('No se pudo copiar. Selecciónalo y cópialo a mano.');
  }
};

export const InviteModal: React.FC<InviteModalProps> = ({ group, onClose }) => {
  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isPrivate = group?.visibility === 'PRIVATE';
  const groupId = group?.id;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ mode: 'onChange', defaultValues: { password: '', confirmPassword: '' } });
  const newPassword = watch('password');

  const loadInvite = useCallback(
    async (regenerate: boolean) => {
      if (!groupId) return;
      setLoading(true);
      setError(null);
      try {
        setInvite(await groupService.createInvite(groupId, regenerate));
        if (regenerate) toast.success('Enlace nuevo creado. El anterior ya no funciona.');
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [groupId]
  );

  useEffect(() => {
    setInvite(null);
    setCopied(false);
    reset();
    if (groupId) void loadInvite(false);
  }, [groupId, loadInvite, reset]);

  const link = invite ? buildInviteLink(invite.code, invite.token) : '';

  const copyLink = async () => {
    await copyText(link, 'Enlace');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const onChangePassword = async ({ password }: PasswordForm) => {
    if (!group) return;
    try {
      await groupService.changePassword(group.id, password);
      toast.success('Contraseña del grupo actualizada');
      reset();
    } catch (err) {
      if (!applyServerErrors(err, setFieldError)) toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Modal isOpen={Boolean(group)} onClose={onClose} title="Invitar al grupo">
      <div className="space-y-6">
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Link2 size={15} className="text-indigo-600" /> Enlace de invitación
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {isPrivate
              ? 'Quien abra este enlace entra al grupo sin necesitar la contraseña.'
              : 'Compártelo para que tus compañeros lleguen directo al grupo.'}{' '}
            Vence a los 7 días.
          </p>
          {loading ? (
            <Spinner size={20} label="Preparando enlace..." />
          ) : error ? (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          ) : invite ? (
            <>
              <div className="mt-3 flex gap-2">
                <input
                  readOnly
                  value={link}
                  aria-label="Enlace de invitación"
                  onFocus={(event) => event.target.select()}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  Código{' '}
                  <button
                    type="button"
                    onClick={() => copyText(invite.code, 'Código')}
                    className="font-mono font-semibold tracking-wider text-slate-800 hover:underline"
                  >
                    {invite.code}
                  </button>{' '}
                  · vence el {formatDateTime(invite.expiresAt)}
                </span>
                <button
                  type="button"
                  onClick={() => void loadInvite(true)}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-indigo-700"
                >
                  <RefreshCw size={12} /> Crear enlace nuevo
                </button>
              </div>
            </>
          ) : null}
        </section>

        {isPrivate && (
          <section className="border-t border-slate-100 pt-5">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <KeyRound size={15} className="text-amber-600" /> ¿Olvidaste la contraseña?
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Por seguridad la guardamos cifrada y nadie puede verla, ni siquiera tú. Puedes ponerle una nueva; los
              miembros actuales no se ven afectados.
            </p>
            <form onSubmit={handleSubmit(onChangePassword)} className="mt-3 space-y-2" noValidate>
              <PasswordInput
                aria-label="Nueva contraseña"
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Escribe la nueva contraseña',
                  minLength: { value: 4, message: 'Usa al menos 4 caracteres' },
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                })}
                hasError={Boolean(errors.password)}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              <PasswordInput
                aria-label="Confirmar nueva contraseña"
                placeholder="Confirmar nueva contraseña"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
                })}
                hasError={Boolean(errors.confirmPassword)}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </Modal>
  );
};
