import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, KeyRound, MailCheck, Send } from 'lucide-react';
import { authService } from '../services/authService';
import { extractErrorMessage } from '../utils/errors';
import { applyServerErrors, inputClass } from '../utils/forms';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { PasswordInput } from '../components/common/PasswordInput';

interface EmailForm {
  email: string;
}

interface ResetForm {
  code: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkEmail = searchParams.get('email') ?? '';
  const linkCode = searchParams.get('code') ?? '';
  const [email, setEmail] = useState(linkEmail);
  const [step, setStep] = useState<'email' | 'reset'>(linkEmail ? 'reset' : 'email');

  const emailForm = useForm<EmailForm>({ mode: 'onChange', defaultValues: { email: linkEmail } });
  const resetForm = useForm<ResetForm>({
    mode: 'onChange',
    defaultValues: { code: linkCode, password: '', confirmPassword: '' },
  });
  const newPassword = resetForm.watch('password');

  const sendCode = async ({ email: value }: EmailForm) => {
    try {
      await authService.forgotPassword(value.trim());
      setEmail(value.trim());
      setStep('reset');
      toast.success('Si el correo está registrado, te llegará un código en unos segundos.');
    } catch (error) {
      if (!applyServerErrors(error, emailForm.setError)) toast.error(extractErrorMessage(error));
    }
  };

  const resend = async () => {
    try {
      await authService.forgotPassword(email);
      toast.success('Te enviamos un código nuevo.');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const savePassword = async ({ code, password }: ResetForm) => {
    try {
      await authService.resetPassword({ email, code: code.trim(), password });
      toast.success('¡Listo! Ya puedes iniciar sesión con tu nueva contraseña.');
      navigate('/login', { replace: true });
    } catch (error) {
      if (!applyServerErrors(error, resetForm.setError)) {
        resetForm.setError('code', { type: 'server', message: extractErrorMessage(error) });
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-slate-100 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            {step === 'email' ? <KeyRound size={24} /> : <MailCheck size={24} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 'email' ? '¿Olvidaste tu contraseña?' : 'Crea una nueva contraseña'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === 'email'
              ? 'Escribe el correo de tu cuenta y te enviaremos un código de 6 dígitos.'
              : `Escribe el código que enviamos a ${email}. Vence en 15 minutos.`}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(sendCode)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-700">
                Correo electrónico
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                {...emailForm.register('email', {
                  required: 'Escribe tu correo',
                  pattern: { value: EMAIL_PATTERN, message: 'Escribe un correo válido' },
                })}
                className={inputClass(Boolean(emailForm.formState.errors.email))}
              />
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={emailForm.formState.isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={16} /> {emailForm.formState.isSubmitting ? 'Enviando...' : 'Enviarme el código'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetForm.handleSubmit(savePassword)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-code" className="block text-xs font-semibold text-slate-700">
                Código de verificación
              </label>
              <input
                id="reset-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                {...resetForm.register('code', {
                  required: 'Escribe el código',
                  pattern: { value: /^\d{6}$/, message: 'El código tiene 6 dígitos' },
                })}
                className={`${inputClass(Boolean(resetForm.formState.errors.code))} text-center font-mono text-lg tracking-[0.5em]`}
              />
              {resetForm.formState.errors.code && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.code.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="reset-password" className="block text-xs font-semibold text-slate-700">
                Nueva contraseña
              </label>
              <PasswordInput
                id="reset-password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres, con letras y números"
                {...resetForm.register('password', {
                  required: 'Escribe tu nueva contraseña',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Debe incluir al menos una letra y un número' },
                })}
                hasError={Boolean(resetForm.formState.errors.password)}
              />
              {resetForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="reset-confirm" className="block text-xs font-semibold text-slate-700">
                Confirmar contraseña
              </label>
              <PasswordInput
                id="reset-confirm"
                autoComplete="new-password"
                placeholder="Vuelve a escribirla"
                {...resetForm.register('confirmPassword', {
                  validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
                })}
                hasError={Boolean(resetForm.formState.errors.confirmPassword)}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={resetForm.formState.isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <KeyRound size={16} /> {resetForm.formState.isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="font-semibold text-slate-500 hover:text-slate-800"
              >
                Usar otro correo
              </button>
              <button type="button" onClick={resend} className="font-semibold text-indigo-600 hover:underline">
                Reenviar código
              </button>
            </div>
          </form>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={14} /> Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
};
