import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MonitorPlay } from 'lucide-react';
import { Modal } from '../common/Modal';
import { StudySessionResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { inputClass } from '../../utils/forms';

const YOUTUBE_URL = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|shorts\/|embed\/)|youtu\.be\/)[\w-]{11}/;

interface RecordingModalProps {
  session: StudySessionResponse | null;
  onClose: () => void;
  onSave: (session: StudySessionResponse, recordingUrl: string) => Promise<void>;
}

export const RecordingModal: React.FC<RecordingModalProps> = ({ session, onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(session?.recordingUrl ?? '');
    setError(null);
  }, [session]);

  const save = async (recordingUrl: string) => {
    if (!session) return;
    if (recordingUrl && !YOUTUBE_URL.test(recordingUrl)) {
      setError('Pega un enlace de YouTube (youtube.com o youtu.be)');
      return;
    }
    setSaving(true);
    try {
      await onSave(session, recordingUrl);
      toast.success(recordingUrl ? 'Grabación adjuntada' : 'Grabación quitada');
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={Boolean(session)} onClose={onClose} title="Grabación de la asesoría">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save(url.trim());
        }}
        className="space-y-4"
        noValidate
      >
        <p className="text-sm text-slate-600">
          Sube la grabación a YouTube (puede ser como “no listado”) y pega aquí el enlace. Validamos que el video exista.
        </p>
        <div>
          <label htmlFor="recording-url" className="block text-xs font-semibold text-slate-700">
            Enlace de YouTube
          </label>
          <input
            id="recording-url"
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError(null);
            }}
            placeholder="https://youtu.be/..."
            className={inputClass(Boolean(error))}
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-between gap-2">
          {session?.recordingUrl ? (
            <button
              type="button"
              onClick={() => void save('')}
              disabled={saving}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Quitar grabación
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving || !url.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <MonitorPlay size={14} /> {saving ? 'Validando...' : 'Guardar grabación'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
