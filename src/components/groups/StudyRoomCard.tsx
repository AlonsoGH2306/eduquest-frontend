import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Coffee, LogIn, LogOut, Square, Timer, Users } from 'lucide-react';
import { StudyRoom } from '../../types';
import { clockOffset, formatCountdown, phaseOf } from '../../utils/studyRoom';
import { extractErrorMessage } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';

interface StudyRoomCardProps {
  room: StudyRoom | null;
  currentUserId?: number;
  canManage: boolean;
  onStart: (focusMinutes: number, breakMinutes: number) => Promise<void>;
  onAction: (action: 'join' | 'leave' | 'stop') => Promise<void>;
}

const PRESETS = [
  { focus: 25, rest: 5, label: '25 / 5' },
  { focus: 50, rest: 10, label: '50 / 10' },
  { focus: 90, rest: 15, label: '90 / 15' },
];

export const StudyRoomCard: React.FC<StudyRoomCardProps> = ({ room, currentUserId, canManage, onStart, onAction }) => {
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [preset, setPreset] = useState(0);
  const offset = useMemo(() => (room ? clockOffset(room) : 0), [room]);
  const phase = room ? phaseOf(room, offset, now) : null;
  const joined = Boolean(room?.participants.some((participant) => participant.id === currentUserId));
  const canStop = Boolean(room && (room.startedById === currentUserId || canManage));

  useEffect(() => {
    if (!room?.active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [room?.active]);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!room?.active || !phase) {
    return (
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
            <Timer size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Sala de estudio</p>
            <p className="text-xs text-slate-500">Un Pomodoro compartido: todos estudian y descansan al mismo tiempo.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="study-preset" className="sr-only">
            Duración
          </label>
          <select
            id="study-preset"
            value={preset}
            onChange={(event) => setPreset(Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-2 py-2 text-xs"
          >
            {PRESETS.map((item, index) => (
              <option key={item.label} value={index}>
                {item.label} min
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onStart(PRESETS[preset].focus, PRESETS[preset].rest))}
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Iniciar sala
          </button>
        </div>
      </section>
    );
  }

  const focus = phase.phase === 'FOCUS';
  return (
    <section
      className={`mb-6 flex flex-col gap-4 rounded-2xl border p-4 shadow-xs sm:flex-row sm:items-center ${
        focus ? 'border-indigo-200 bg-indigo-50' : 'border-emerald-200 bg-emerald-50'
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-4">
        <span className={`rounded-xl p-2 ${focus ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {focus ? <Timer size={22} /> : <Coffee size={22} />}
        </span>
        <div>
          <p className={`text-xs font-bold tracking-wide uppercase ${focus ? 'text-indigo-700' : 'text-emerald-700'}`}>
            {focus ? 'Concentración' : 'Descanso'} · ronda {phase.round}
          </p>
          <p className="font-mono text-3xl font-bold text-slate-900">{formatCountdown(phase.secondsLeft)}</p>
        </div>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <Users size={14} className="text-slate-500" />
        <div className="flex -space-x-2">
          {room.participants.slice(0, 6).map((participant) => (
            <span key={participant.id} title={`@${participant.username}`} className="rounded-full ring-2 ring-white">
              <UserAvatar username={participant.username} avatarUrl={participant.avatarUrl} size={28} />
            </span>
          ))}
        </div>
        <span className="text-xs text-slate-600">
          {room.participants.length === 1 ? '1 persona estudiando' : `${room.participants.length} personas estudiando`}
        </span>
      </div>
      <div className="flex gap-2">
        {joined ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('leave'))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={14} /> Salir
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('join'))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <LogIn size={14} /> Unirme
          </button>
        )}
        {canStop && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('stop'))}
            aria-label="Terminar sala de estudio"
            title="Terminar sala"
            className="rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-slate-600 hover:text-red-600"
          >
            <Square size={14} />
          </button>
        )}
      </div>
    </section>
  );
};
