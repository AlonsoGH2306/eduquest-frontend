import React, { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserResponse } from '../../types';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

interface WarnUserModalProps {
  user: UserResponse | null;
  saving: boolean;
  onConfirm: (user: UserResponse, message: string) => void;
  onClose: () => void;
}

export const WarnUserModal: React.FC<WarnUserModalProps> = ({ user, saving, onConfirm, onClose }) => {
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setMessage('');
    setTouched(false);
  }, [user?.id]);

  const trimmed = message.trim();
  const error =
    trimmed.length < MIN_LENGTH
      ? `Explica qué debe corregir (mínimo ${MIN_LENGTH} caracteres).`
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
    <Modal isOpen={user !== null} onClose={saving ? () => undefined : onClose} title={`Advertir a @${user?.username ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-xs text-slate-600">
          Le llegará a su campana de notificaciones. Es un primer aviso antes de una suspensión.
        </p>
        <div>
          <label htmlFor="warning-message" className="block text-xs font-semibold text-slate-700">
            Mensaje
          </label>
          <textarea
            id="warning-message"
            rows={4}
            maxLength={MAX_LENGTH}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setTouched(true);
            }}
            placeholder="Ej. Tus últimos mensajes en el chat del grupo no respetan las normas de convivencia."
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
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <TriangleAlert size={14} /> {saving ? 'Enviando...' : 'Enviar advertencia'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
