import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CheckCircle2, UserX } from 'lucide-react';
import { BAN_STORAGE_KEY } from '../services/axiosInstance';
import { BanInfo } from '../types';

const RULES = [
  'Compartir solo material académico y propio o con permiso de su autor.',
  'Tratar con respeto a los demás estudiantes en grupos y reseñas.',
  'No publicar spam, publicidad ni contenido ofensivo.',
];

const readBanInfo = (): BanInfo | null => {
  try {
    const raw = sessionStorage.getItem(BAN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BanInfo) : null;
  } catch {
    return null;
  }
};

export const BannedPage: React.FC = () => {
  const navigate = useNavigate();
  const info = useMemo(readBanInfo, []);

  const goBack = () => {
    sessionStorage.removeItem(BAN_STORAGE_KEY);
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
          <UserX size={38} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tu cuenta fue suspendida</h1>
        <p className="mt-2 text-sm text-slate-600">
          Un administrador vetó tu cuenta por incumplir las normas de la comunidad. Mientras el veto siga activo no
          podrás usar EduQuest.
        </p>

        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700">Motivo</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {info?.reason || 'El administrador no dejó un detalle.'}
          </p>
          {info?.bannedAt && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarClock size={13} /> Desde el {new Date(info.bannedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-6 text-left">
          <h2 className="text-sm font-bold text-slate-900">Normas de EduQuest</h2>
          <ul className="mt-2 space-y-2">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-2 text-xs text-slate-600">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-indigo-600" /> {rule}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Si crees que se trata de un error, comunícate con el equipo de EduQuest o con tu docente.
        </p>

        <button
          type="button"
          onClick={goBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <ArrowLeft size={15} /> Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
};
