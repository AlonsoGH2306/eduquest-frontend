import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MessageSquareWarning, Send } from 'lucide-react';
import { authService } from '../../services/authService';
import { extractErrorMessage } from '../../utils/errors';
import { inputClass } from '../../utils/forms';
import { PasswordInput } from '../common/PasswordInput';

interface AppealValues {
  username: string;
  password: string;
  message: string;
}

export const AppealForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppealValues>({ mode: 'onChange', defaultValues: { username: '', password: '', message: '' } });

  const submit = async (values: AppealValues) => {
    try {
      await authService.submitAppeal(values.username.trim(), values.password, values.message.trim());
      setSent(true);
      toast.success('Enviamos tu apelación a la moderación');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (sent) {
    return (
      <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm text-emerald-700">
        Recibimos tu apelación. Te avisaremos por correo cuando la moderación la revise.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <MessageSquareWarning size={15} /> ¿Crees que es un error? Apelar
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 space-y-3 rounded-2xl border border-slate-200 p-4 text-left">
      <h2 className="text-sm font-bold text-slate-900">Apelar la suspensión</h2>
      <p className="text-xs text-slate-500">Confirma tu cuenta y explica por qué deberíamos revisar el caso.</p>
      <div>
        <label htmlFor="appeal-username" className="text-xs font-semibold text-slate-700">
          Nombre de usuario
        </label>
        <input
          id="appeal-username"
          autoComplete="username"
          className={inputClass(Boolean(errors.username))}
          {...register('username', { required: 'Ingresa tu nombre de usuario' })}
        />
        {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor="appeal-password" className="text-xs font-semibold text-slate-700">
          Contraseña
        </label>
        <PasswordInput
          id="appeal-password"
          autoComplete="current-password"
          hasError={Boolean(errors.password)}
          {...register('password', { required: 'Ingresa tu contraseña' })}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="appeal-message" className="text-xs font-semibold text-slate-700">
          Tu explicación
        </label>
        <textarea
          id="appeal-message"
          rows={4}
          maxLength={1000}
          className={inputClass(Boolean(errors.message))}
          {...register('message', {
            required: 'Cuéntanos qué pasó',
            minLength: { value: 20, message: 'Escribe al menos 20 caracteres' },
          })}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Send size={14} /> {isSubmitting ? 'Enviando...' : 'Enviar apelación'}
        </button>
      </div>
    </form>
  );
};
