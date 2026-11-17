import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Plus, Sticker as StickerIcon, X } from 'lucide-react';
import { stickerService } from '../../services/stickerService';
import { documentService } from '../../services/documentService';
import { Sticker } from '../../types';
import { extractErrorMessage, isCanceledError } from '../../utils/errors';
import { packCode, STICKER_PACK } from '../../utils/stickers';
import { StickerView } from './StickerView';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_STICKER_MB = 10;

interface StickerPickerProps {
  disabled?: boolean;
  onPick: (sticker: string) => Promise<void>;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ disabled, onPick }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'pack' | 'mine'>('pack');
  const [mine, setMine] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || tab !== 'mine') return;
    const controller = new AbortController();
    setLoading(true);
    stickerService
      .getMine(controller.signal)
      .then(setMine)
      .catch((err) => {
        if (!isCanceledError(err)) toast.error(extractErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = async (value: string) => {
    setOpen(false);
    try {
      await onPick(value);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error('El sticker debe ser PNG, JPG, WEBP o GIF (puede ser animado)');
      return;
    }
    if (file.size > MAX_STICKER_MB * 1024 * 1024) {
      toast.error(`El sticker no debe superar los ${MAX_STICKER_MB} MB`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await documentService.uploadFile(file);
      const sticker = await stickerService.add(uploaded.url);
      setMine((current) => [sticker, ...current]);
      toast.success('Sticker guardado en tu colección');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (sticker: Sticker) => {
    try {
      await stickerService.remove(sticker.id);
      setMine((current) => current.filter((item) => item.id !== sticker.id));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-2 py-1 text-xs font-semibold ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-label="Enviar un sticker"
        title="Stickers"
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:opacity-40"
      >
        <StickerIcon size={16} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-80 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex gap-1 rounded-xl bg-slate-50 p-1">
            <button type="button" className={tabClass(tab === 'pack')} onClick={() => setTab('pack')}>
              EduQuest
            </button>
            <button type="button" className={tabClass(tab === 'mine')} onClick={() => setTab('mine')}>
              Mis stickers
            </button>
          </div>
          {tab === 'pack' ? (
            <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto">
              {STICKER_PACK.map((sticker) => (
                <button
                  key={sticker.code}
                  type="button"
                  onClick={() => void pick(packCode(sticker.code))}
                  title={sticker.label}
                  className="rounded-2xl transition hover:scale-105"
                >
                  <StickerView value={packCode(sticker.code)} size={64} />
                </button>
              ))}
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <input ref={inputRef} type="file" accept={IMAGE_TYPES.join(',')} onChange={upload} className="sr-only" tabIndex={-1} />
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Crear sticker desde una imagen"
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </button>
                {mine.map((sticker) => (
                  <div key={sticker.id} className="group relative">
                    <button type="button" onClick={() => void pick(sticker.imageUrl)} className="block">
                      <StickerView value={sticker.imageUrl} size={64} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(sticker)}
                      aria-label="Quitar sticker de mi colección"
                      className="absolute -top-1 -right-1 hidden rounded-full bg-slate-800 p-0.5 text-white group-hover:block"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {loading && <p className="mt-2 text-center text-xs text-slate-400">Cargando...</p>}
              {!loading && mine.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Sube una imagen o un GIF animado para crear tu primer sticker (hasta 30).
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
