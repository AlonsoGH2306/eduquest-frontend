import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bookmark, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { personalService } from '../../services/personalService';
import { Availability } from '../../types';
import { AVAILABILITY_OPTIONS, STATUS_EMOJIS, availabilityDot } from '../../utils/availability';
import { extractErrorMessage } from '../../utils/errors';
import { UserAvatar } from '../common/UserAvatar';

export const StatusMenu: React.FC = () => {
  const { user, roleName } = useAuth();
  const [open, setOpen] = useState(false);
  const [availability, setAvailability] = useState<Availability>('AVAILABLE');
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('');
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    userService
      .getMe(controller.signal)
      .then((me) => {
        setAvailability(me.availability ?? 'AVAILABLE');
        setText(me.statusText ?? '');
        setEmoji(me.statusEmoji ?? '');
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const save = async (next: { availability?: Availability; text?: string; emoji?: string } = {}) => {
    const payload = {
      availability: next.availability ?? availability,
      statusText: (next.text ?? text).trim() || undefined,
      statusEmoji: (next.emoji ?? emoji) || undefined,
    };
    setSaving(true);
    try {
      const saved = await personalService.updateStatus(payload);
      setAvailability(saved.availability === 'AVAILABLE' && payload.availability === 'INVISIBLE' ? 'INVISIBLE' : saved.availability);
      setText(saved.statusText ?? '');
      setEmoji(saved.statusEmoji ?? '');
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Mi estado y perfil"
        className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition hover:bg-hover"
      >
        <span className="relative shrink-0">
          <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={32} />
          <span
            className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full ring-[3px] ring-[var(--eq-panel)] ${availabilityDot(availability)}`}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-ink">{user.username}</span>
          <span className="block truncate text-[11px] text-faint">{text ? `${emoji} ${text}`.trim() : roleName}</span>
        </span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-2xl">
          <p className="mb-2 text-[11px] font-bold tracking-wide text-slate-500 uppercase">Disponibilidad</p>
          <div className="grid grid-cols-2 gap-1">
            {AVAILABILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={saving}
                onClick={() => {
                  setAvailability(option.value);
                  void save({ availability: option.value });
                }}
                aria-pressed={availability === option.value}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  availability === option.value ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} /> {option.label}
              </button>
            ))}
          </div>
          <p className="mt-3 mb-1.5 text-[11px] font-bold tracking-wide text-slate-500 uppercase">Estado personalizado</p>
          <div className="mb-2 flex gap-1">
            {STATUS_EMOJIS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setEmoji(emoji === item ? '' : item)}
                aria-pressed={emoji === item}
                className={`rounded-lg p-1 text-base ${emoji === item ? 'bg-indigo-100' : 'hover:bg-slate-100'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="flex gap-1.5"
          >
            <label htmlFor="status-text" className="sr-only">
              Estado
            </label>
            <input
              id="status-text"
              value={text}
              maxLength={80}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ej. Estudiando Cálculo"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-indigo-600 px-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Guardar
            </button>
          </form>
          {(text || emoji) && (
            <button
              type="button"
              onClick={() => void save({ text: '', emoji: '' })}
              className="mt-1 text-[11px] text-slate-500 hover:text-red-600 hover:underline"
            >
              Borrar estado
            </button>
          )}
          <div className="mt-3 space-y-0.5 border-t border-slate-100 pt-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <UserRound size={14} /> Mi perfil
            </Link>
            <Link
              to="/saved"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <Bookmark size={14} /> Mensajes guardados
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
