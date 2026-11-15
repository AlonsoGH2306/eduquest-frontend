import React, { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserResponse } from '../../types';

const COMMON_REASONS = [
  'Spam o publicidad',
  'Material ofensivo o inapropiado',
  'Acoso a otros estudiantes',
  'Material con derechos de autor sin permiso',
];

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

interface BanUserModalProps {
  user: UserResponse | null;
  saving: boolean;
  onConfirm: (user: UserResponse, reason: string) => void;
  onClose: () => void;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({ user, saving, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setReason('');
    setTouched(false);
  }, [user?.id]);

  const trimmed = reason.trim();
  const error =
    trimmed.length < MIN_LENGTH
      ? `Explica qué norma incumplió (mínimo ${MIN_LENGTH} caracteres).`
      : trimmed.length > MAX_LENGTH
        ? `Máximo ${MAX_LENGTH} caracteres.`
        : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!user || error || saving) return;
    onConfirm(user, trimmed);
  };

  return (
    <Modal isOpen={user !== null} onClose={saving ? () => undefined : onClose} title={`Vetar a @${user?.username ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-xs text-slate-600">
          No podrá entrar a EduQuest y verá este motivo al intentarlo. Úsalo solo si incumplió las normas de la
          aplicación.
        </p>

        <div className="flex flex-wrap gap-2">
          {COMMON_REASONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setReason(option);
                setTouched(true);
              }}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                reason === option
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="ban-reason" className="block text-xs font-semibold text-slate-700">
            Motivo del veto
          </label>
          <textarea
            id="ban-reason"
            rows={3}
            maxLength={MAX_LENGTH}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setTouched(true);
            }}
            className={`mt-1 w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-hidden ${
              touched && error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'
            }`}
          />
          <p className={`mt-1 text-xs ${touched && error ? 'text-red-600' : 'text-slate-400'}`}>
            {touched && error ? error : `${trimmed.length}/${MAX_LENGTH}`}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <UserX size={14} /> {saving ? 'Vetando...' : 'Vetar cuenta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
