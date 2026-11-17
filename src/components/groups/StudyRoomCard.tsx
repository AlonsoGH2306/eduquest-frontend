import React, { useEffect, useId, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LogIn, LogOut, Square } from 'lucide-react';
import { Lumi } from '../brand/Lumi';
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
  className?: string;
}

const PRESETS = [
  { focus: 25, rest: 5, label: '25 / 5' },
  { focus: 50, rest: 10, label: '50 / 10' },
  { focus: 90, rest: 15, label: '90 / 15' },
];

export const StudyRoomCard: React.FC<StudyRoomCardProps> = ({
  room,
  currentUserId,
  canManage,
  onStart,
  onAction,
  className = '',
}) => {
  const idSuffix = useId().replace(/[^a-zA-Z0-9_-]/g, '');
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
      <section aria-label="Sala de estudio" className={`flex flex-col gap-3 rounded-2xl bg-raised p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <Lumi mood="sleepy" size={48} animated={false} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Sala de estudio</p>
            <p className="text-xs text-slate-500">Un Pomodoro compartido: estudian y descansan a la vez.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`study-preset-${idSuffix}`} className="sr-only">
            Duración del enfoque y del descanso
          </label>
          <select
            id={`study-preset-${idSuffix}`}
            value={preset}
            onChange={(event) => setPreset(Number(event.target.value))}
            className="h-10 min-w-0 flex-1 rounded-full bg-slate-100 px-3 text-sm"
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
            className="h-10 shrink-0 rounded-full bg-lumi px-4 text-sm font-bold text-noche hover:brightness-105 disabled:opacity-50"
          >
            Encender
          </button>
        </div>
      </section>
    );
  }

  const focus = phase.phase === 'FOCUS';
  const people = room.participants.length;
  return (
    <section
      aria-label="Sala de estudio"
      aria-live="polite"
      className={`flex flex-col gap-2 rounded-2xl p-4 ${focus ? 'eq-live bg-[#24204f] text-white' : 'bg-raised'} ${className}`}
    >
      <p className={`text-xs font-extrabold ${focus ? 'text-lumi' : 'text-mint-ink'}`}>
        Sala de estudio · {focus ? 'Enfoque' : 'Descanso'}
      </p>
      <p className={`font-display text-4xl font-extrabold tabular-nums ${focus ? 'text-white' : 'text-slate-900'}`}>
        {formatCountdown(phase.secondsLeft)}
      </p>
      <p className={`text-sm ${focus ? 'text-[#c8c4ff]' : 'text-slate-600'}`}>
        Ronda {phase.round} · {people === 1 ? '1 estudiando' : `${people} estudiando`}
      </p>
      {people > 0 && (
        <div className="flex -space-x-2">
          {room.participants.slice(0, 6).map((participant) => (
            <span key={participant.id} title={`@${participant.username}`} className="rounded-full ring-2 ring-[#24204f]">
              <UserAvatar username={participant.username} avatarUrl={participant.avatarUrl} size={26} />
            </span>
          ))}
        </div>
      )}
      <div className="mt-1 flex gap-2">
        {joined ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('leave'))}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-bold disabled:opacity-50 ${
              focus ? 'bg-white/15 hover:bg-white/25' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            <LogOut size={15} /> Salir
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('join'))}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-lumi text-sm font-bold text-noche hover:brightness-105 disabled:opacity-50"
          >
            <LogIn size={15} /> Unirme
          </button>
        )}
        {canStop && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => onAction('stop'))}
            aria-label="Apagar la sala de estudio"
            title="Apagar la sala"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50 ${
              focus ? 'bg-white/15 hover:bg-red-500' : 'bg-slate-100 text-slate-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Square size={14} />
          </button>
        )}
      </div>
    </section>
  );
};
