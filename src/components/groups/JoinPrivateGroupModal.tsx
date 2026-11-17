import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';
import { extractErrorMessage, getErrorStatus } from '../../utils/errors';
import { GroupResponse } from '../../types';

interface JoinPrivateGroupModalProps {
  group: GroupResponse | null;
  onClose: () => void;
  onJoin: (groupId: number, password: string) => Promise<GroupResponse>;
  onJoined: (group: GroupResponse) => void;
}

export const JoinPrivateGroupModal: React.FC<JoinPrivateGroupModalProps> = ({ group, onClose, onJoin, onJoined }) => {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    setPassword('');
    setError(null);
    setVisible(false);
  }, [group?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!group || !password) return;
    setJoining(true);
    try {
      const joined = await onJoin(group.id, password);
      toast.success(`¡Te uniste al grupo "${joined.name}"!`);
      onJoined(joined);
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 403) {
        setError('La contraseña no es correcta. Revísala e inténtalo otra vez.');
      } else if (status === 409) {
        onJoined({ ...group, member: true });
      } else {
        toast.error(extractErrorMessage(err));
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal isOpen={group !== null} onClose={joining ? () => undefined : onClose} title="Unirse a un grupo privado">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-start gap-3 rounded-xl bg-indigo-50/70 p-3">
          <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
            <Lock size={16} />
          </div>
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">{group?.name}</span> es privado. Escribe la contraseña
            que te compartió su creador.
          </p>
        </div>

        <div>
          <label htmlFor="group-password" className="block text-xs font-semibold text-slate-700">
            Contraseña del grupo
          </label>
          <div className="relative mt-1">
            <input
              id="group-password"
              type={visible ? 'text' : 'password'}
              autoFocus
              autoComplete="off"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className={`w-full rounded-xl border px-3.5 py-2 pr-10 text-sm focus:outline-hidden ${
                error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'
              }`}
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={joining}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={joining || !password}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {joining ? 'Verificando...' : 'Unirme'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
