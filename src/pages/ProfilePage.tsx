import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, GraduationCap, Moon, Save, Sun, Trash2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { extractErrorMessage } from '../utils/errors';
import { applyServerErrors, inputClass } from '../utils/forms';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { UserAvatar } from '../components/common/UserAvatar';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm';

interface UsernameForm {
  username: string;
}

export const ProfilePage: React.FC = () => {
  const { roleName } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    advisor,
    savingName,
    savingAvatar,
    savingAdvisor,
    changeUsername,
    changeAdvisor,
    validateAvatar,
    changeAvatar,
    removeAvatar,
  } = useProfile();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<UsernameForm>({ mode: 'onChange', values: { username: user?.username ?? '' } });

  const onSubmit = async ({ username }: UsernameForm) => {
    try {
      await changeUsername(username.trim());
      toast.success('Nombre de usuario actualizado');
    } catch (error) {
      if (!applyServerErrors(error, setError)) setError('username', { type: 'server', message: extractErrorMessage(error) });
    }
  };

  const onToggleAdvisor = async () => {
    try {
      await changeAdvisor(!advisor);
      toast.success(advisor ? 'Ya no apareces como asesor' : '¡Ahora apareces como asesor!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const onPickFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const problem = validateAvatar(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      await changeAvatar(file);
      toast.success('Foto de perfil actualizada');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const onRemoveAvatar = async () => {
    try {
      await removeAvatar();
      toast.success('Foto de perfil eliminada');
      setConfirmRemove(false);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ label: 'Mi perfil' }]} />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Mi perfil</h1>

      <section className="mb-6 flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row">
        <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={88} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-lg font-bold text-slate-900">@{user.username}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {roleName}
            </span>
            {advisor && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <GraduationCap size={12} /> Asesor
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={savingAvatar}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Camera size={14} /> {savingAvatar ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          {user.avatarUrl && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={savingAvatar}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={14} /> Quitar foto
            </button>
          )}
          <p className="text-center text-[11px] text-slate-400">JPG, PNG o WEBP · máx. 2 MB</p>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Nombre de usuario</h2>
        <p className="mt-1 text-xs text-slate-500">Es el nombre que ven los demás en grupos, reseñas y sesiones.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start" noValidate>
          <div className="flex-1">
            <label htmlFor="profile-username" className="sr-only">
              Nombre de usuario
            </label>
            <input
              id="profile-username"
              type="text"
              {...register('username', {
                required: 'El nombre de usuario es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                pattern: { value: /^\S+$/, message: 'No uses espacios' },
              })}
              className={inputClass(Boolean(errors.username))}
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
          </div>
          <button
            type="submit"
            disabled={savingName || !isDirty}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={14} /> {savingName ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </section>

      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Perfil de asesor</h2>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Los asesores dictan sesiones en los grupos. Verán una insignia junto a tu nombre en miembros, sesiones y chat.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={advisor}
          onClick={onToggleAdvisor}
          disabled={savingAdvisor}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition disabled:opacity-50 ${
            advisor
              ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <GraduationCap size={14} />
          {savingAdvisor ? 'Guardando...' : advisor ? 'Dejar de ser asesor' : 'Ser asesor'}
        </button>
      </section>

      <ChangePasswordForm />

      <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Apariencia</h2>
          <p className="mt-1 text-xs text-slate-500">Tema {theme === 'dark' ? 'oscuro' : 'claro'} activado.</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} Usar tema {theme === 'dark' ? 'claro' : 'oscuro'}
        </button>
      </section>

      <ConfirmModal
        isOpen={confirmRemove}
        title="Quitar foto de perfil"
        message="Volverás a mostrar tu inicial en lugar de la foto."
        confirmLabel="Quitar foto"
        loadingLabel="Quitando..."
        destructive
        loading={savingAvatar}
        onConfirm={onRemoveAvatar}
        onClose={() => setConfirmRemove(false)}
      />
    </div>
  );
};
