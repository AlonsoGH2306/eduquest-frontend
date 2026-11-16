import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { groupService } from '../../services/groupService';
import { extractErrorMessage, isCanceledError } from '../../utils/errors';

interface ModerationModalProps {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_WORDS = 50;

export const ModerationModal: React.FC<ModerationModalProps> = ({ groupId, isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    setLoading(true);
    groupService
      .getModeration(groupId, controller.signal)
      .then((words) => setText(words.join(', ')))
      .catch((err) => {
        if (!isCanceledError(err)) toast.error(extractErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [groupId, isOpen]);

  const words = text
    .split(/[,\n]/)
    .map((word) => word.trim())
    .filter(Boolean);

  const save = async () => {
    if (words.length > MAX_WORDS || saving) return;
    setSaving(true);
    try {
      await groupService.updateModeration(groupId, words);
      toast.success('Filtro de palabras actualizado');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Moderación del chat">
      <div className="space-y-3">
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <ShieldAlert size={16} className="shrink-0" />
          Los mensajes que contengan estas palabras se rechazan en todos los canales del grupo. No distingue mayúsculas ni tildes.
        </p>
        <label htmlFor="banned-words" className="block text-xs font-semibold text-slate-700">
          Palabras prohibidas (separadas por comas)
        </label>
        <textarea
          id="banned-words"
          rows={4}
          value={text}
          disabled={loading}
          onChange={(event) => setText(event.target.value)}
          placeholder="spam, insulto, ..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
        />
        <p className={`text-[11px] ${words.length > MAX_WORDS ? 'text-red-600' : 'text-slate-500'}`}>
          {words.length} de {MAX_WORDS} palabras
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || loading || words.length > MAX_WORDS}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
