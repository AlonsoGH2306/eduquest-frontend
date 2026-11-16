import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { userService } from '../../services/userService';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors } from '../../utils/forms';
import { PasswordInput } from '../common/PasswordInput';

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: password }: ChangePasswordValues) => {
    try {
      await userService.changePassword(currentPassword, password);
      toast.success('Contraseña actualizada');
      reset();
    } catch (error) {
      if (applyServerErrors(error, setError)) return;
      const message = extractErrorMessage(error);
      setError(message.toLowerCase().includes('actual') ? 'currentPassword' : 'newPassword', { type: 'server', message });
    }
  };

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
        <KeyRound size={16} className="text-indigo-600" /> Contraseña
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Por seguridad tu contraseña está cifrada y no se puede mostrar. Aquí puedes cambiarla; si no la recuerdas,{' '}
        <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:underline">
          recupérala con tu correo
        </Link>
        .
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3" noValidate>
        <div>
          <label htmlFor="current-password" className="block text-xs font-semibold text-slate-700">
            Contraseña actual
          </label>
          <PasswordInput
            id="current-password"
            autoComplete="current-password"
            {...register('currentPassword', { required: 'Escribe tu contraseña actual' })}
            hasError={Boolean(errors.currentPassword)}
          />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700">
            Nueva contraseña
          </label>
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            {...register('newPassword', {
              required: 'Escribe la nueva contraseña',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Incluye letras y números' },
            })}
            hasError={Boolean(errors.newPassword)}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-slate-700">
            Confirmar nueva
          </label>
          <PasswordInput
            id="confirm-new-password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              validate: (value) => value === newPassword || 'No coinciden',
            })}
            hasError={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex justify-end sm:col-span-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <KeyRound size={14} /> {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </section>
  );
};
