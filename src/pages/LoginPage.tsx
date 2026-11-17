import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Clock, LogIn, MailOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types';
import { extractErrorMessage, getErrorStatus } from '../utils/errors';
import { applyServerErrors, inputClass } from '../utils/forms';
import { AuthShell } from '../components/auth/AuthShell';
import { Lumi } from '../components/brand/Lumi';
import { redirectPathFrom } from '../utils/redirect';
import { PasswordInput } from '../components/common/PasswordInput';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const redirectTo = redirectPathFrom(location.state);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login({ username: data.username.trim(), password: data.password });
      toast.success('¡Bienvenido de nuevo a EduQuest!');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        setError('password', { type: 'server', message: 'Usuario o contraseña incorrectos' });
        return;
      }
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center text-center">
        <Lumi mood="happy" size={72} animated={false} className="mb-2 lg:hidden" />
        <h1 className="text-2xl text-slate-900">Iniciar Sesión</h1>
        <p className="mt-1 text-sm text-slate-500">
          Accede a tus apuntes, grupos de estudio y planificador de estudio
        </p>
      </div>

      {sessionExpired && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
          <Clock size={14} /> Tu sesión expiró. Vuelve a iniciar sesión para continuar.
        </p>
      )}
      {redirectTo.startsWith('/invite/') && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          <MailOpen size={14} /> Inicia sesión o crea tu cuenta para aceptar la invitación al grupo.
        </p>
      )}

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
              required: 'El usuario es obligatorio',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            })}
            autoComplete="username"
            className={inputClass(Boolean(errors.username))}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn size={16} />
          {isSubmitting ? 'Iniciando sesión...' : 'Ingresar a EduQuest'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-indigo-600 hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </AuthShell>
  );
};