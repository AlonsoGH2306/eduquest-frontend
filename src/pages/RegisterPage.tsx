import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types';
import { extractErrorMessage, getErrorStatus } from '../utils/errors';
import { applyServerErrors, inputClass } from '../utils/forms';
import { AuthShell } from '../components/auth/AuthShell';
import { Lumi } from '../components/brand/Lumi';
import { PasswordInput } from '../components/common/PasswordInput';
import { redirectPathFrom } from '../utils/redirect';

interface RegisterForm extends RegisterRequest {
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegisterForm>({
    mode: 'onChange',
    defaultValues: { advisor: false },
  });
  const password = watch('password');

  const onSubmit = async ({ confirmPassword: _confirm, ...data }: RegisterForm) => {
    try {
      await registerUser({ ...data, username: data.username.trim(), email: data.email.trim() });
      toast.success('¡Cuenta creada exitosamente!');
      navigate(redirectPathFrom(location.state), { replace: true });
    } catch (error) {
      if (applyServerErrors(error, setError)) return;
      const message = extractErrorMessage(error);
      if (getErrorStatus(error) === 409) {
        setError(message.toLowerCase().includes('correo') ? 'email' : 'username', { type: 'server', message });
        return;
      }
      toast.error(message);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center text-center">
        <Lumi mood="happy" size={72} animated={false} className="mb-2 lg:hidden" />
        <h1 className="text-2xl text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Únete a la comunidad colaborativa de estudio universitario
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            placeholder="Ej. juanpablo"
            {...register('username', {
              required: 'El nombre de usuario es obligatorio',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
            })}
            autoComplete="username"
            className={inputClass(Boolean(errors.username))}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
            Correo electrónico universitario o personal
          </label>
          <input
            id="email"
            type="email"
            placeholder="estudiante@utec.edu.pe"
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo electrónico válido',
              },
            })}
            autoComplete="email"
            className={inputClass(Boolean(errors.email))}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
            Contraseña
          </label>
          <PasswordInput
            id="password"
            placeholder="Mínimo 8 caracteres, con letras y números"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                message: 'Debe incluir al menos una letra y un número',
              },
              onChange: () => {
                if (touchedFields.confirmPassword) void trigger('confirmPassword');
              },
            })}
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
            Confirmar contraseña
          </label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Vuelve a escribir tu contraseña"
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (value) => value === password || 'Las contraseñas no coinciden',
            })}
            autoComplete="new-password"
            hasError={Boolean(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm transition hover:border-indigo-300">
          <input type="checkbox" {...register('advisor')} className="mt-0.5 h-4 w-4 accent-indigo-600" />
          <span>
            <span className="block font-semibold text-slate-800">Quiero ser asesor</span>
            <span className="block text-xs text-slate-500">
              Podrás dictar asesorías y se mostrará una insignia junto a tu nombre. Puedes cambiarlo luego en tu perfil.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UserPlus size={16} />
          {isSubmitting ? 'Registrando cuenta...' : 'Crear mi cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
};