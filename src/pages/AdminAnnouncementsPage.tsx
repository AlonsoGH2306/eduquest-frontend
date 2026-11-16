import React from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Megaphone, Send, User, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import { extractErrorMessage } from '../utils/errors';
import { applyServerErrors, inputClass } from '../utils/forms';
import { AdminHeader } from '../components/admin/AdminHeader';

interface AnnouncementForm {
  audience: 'ALL' | 'USER';
  username: string;
  title: string;
  message: string;
}

const TITLE_MAX = 100;
const MESSAGE_MAX = 1000;

export const AdminAnnouncementsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementForm>({
    mode: 'onChange',
    defaultValues: { audience: 'ALL', username: '', title: '', message: '' },
  });

  const audience = watch('audience');
  const messageLength = watch('message').length;

  if (!isAdmin) return <Navigate to="/admin/users" replace />;

  const onSubmit = async (form: AnnouncementForm) => {
    try {
      const recipients = await adminService.sendAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        username: form.audience === 'USER' ? form.username.trim().replace(/^@/, '') : undefined,
      });
      toast.success(recipients === 1 ? 'Aviso enviado a 1 persona' : `Aviso enviado a ${recipients} personas`);
      reset({ audience: form.audience, username: form.audience === 'USER' ? form.username : '', title: '', message: '' });
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  const audienceOption = (value: AnnouncementForm['audience'], label: string, Icon: React.ElementType) => (
    <label
      className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
        audience === value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <input type="radio" value={value} className="sr-only" {...register('audience')} />
      <Icon size={16} /> {label}
    </label>
  );

  return (
    <div>
      <AdminHeader
        section="Avisos"
        title="Avisos"
        description="El aviso llega a la campana de notificaciones de cada destinatario en la web y en la app."
        icon={<Megaphone size={24} />}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="max-w-2xl space-y-5 rounded-3xl border border-slate-200 bg-white p-6"
      >
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700">Destinatarios</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {audienceOption('ALL', 'Toda la comunidad', Users)}
            {audienceOption('USER', 'Un usuario', User)}
          </div>
        </fieldset>

        {audience === 'USER' && (
          <div>
            <label htmlFor="announcement-username" className="text-sm font-semibold text-slate-700">
              Nombre de usuario
            </label>
            <input
              id="announcement-username"
              placeholder="@usuario"
              autoComplete="off"
              className={inputClass(Boolean(errors.username))}
              {...register('username', {
                validate: (value) => audience !== 'USER' || value.trim().replace(/^@/, '').length > 0 || 'Indica a quién va dirigido',
              })}
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>
        )}

        <div>
          <label htmlFor="announcement-title" className="text-sm font-semibold text-slate-700">
            Título
          </label>
          <input
            id="announcement-title"
            maxLength={TITLE_MAX}
            placeholder="Ej. Mantenimiento programado"
            className={inputClass(Boolean(errors.title))}
            {...register('title', {
              validate: (value) => {
                const length = value.trim().length;
                if (length < 3) return 'El título debe tener al menos 3 caracteres';
                return length <= TITLE_MAX || `Máximo ${TITLE_MAX} caracteres`;
              },
            })}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="announcement-message" className="text-sm font-semibold text-slate-700">
            Mensaje
          </label>
          <textarea
            id="announcement-message"
            rows={5}
            maxLength={MESSAGE_MAX}
            placeholder="Cuéntales qué está pasando y si deben hacer algo."
            className={`${inputClass(Boolean(errors.message))} resize-y`}
            {...register('message', {
              validate: (value) => value.trim().length > 0 || 'Escribe el mensaje del aviso',
            })}
          />
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-red-600">{errors.message?.message}</span>
            <span className="text-slate-400">
              {messageLength}/{MESSAGE_MAX}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={15} /> {isSubmitting ? 'Enviando...' : 'Enviar aviso'}
          </button>
        </div>
      </form>
    </div>
  );
};
