import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { extractErrorMessage } from '../../utils/errors';

export const EmailVerificationBanner: React.FC = () => {
  const { user, updateSession } = useAuth();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user || user.emailVerified !== false) return null;

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error('El código tiene 6 dígitos');
      return;
    }
    setVerifying(true);
    try {
      await authService.verifyEmail(code.trim());
      updateSession({ ...user, emailVerified: true });
      toast.success('¡Correo verificado! Ya puedes publicar y escribir');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success(`Te enviamos un código nuevo a ${user.email}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <form
        onSubmit={verify}
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 text-sm text-amber-700 sm:px-6"
      >
        <MailCheck size={18} className="shrink-0" />
        <p className="min-w-0 flex-1">
          Confirma tu correo <strong>{user.email}</strong> con el código que te enviamos. Mientras tanto solo puedes leer.
        </p>
        <label htmlFor="verify-code" className="sr-only">
          Código de verificación
        </label>
        <input
          id="verify-code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-24 rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-center font-mono tracking-widest text-slate-800 focus:border-indigo-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={verifying}
          className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {verifying ? 'Verificando...' : 'Verificar'}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="text-xs font-semibold underline disabled:opacity-60"
        >
          Reenviar código
        </button>
      </form>
    </div>
  );
};
