import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, ImagePlus, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GroupAppearance, GroupResponse } from '../../types';
import { documentService } from '../../services/documentService';
import { extractErrorMessage } from '../../utils/errors';
import { GROUP_COLORS, groupColor } from '../../utils/groupAvatar';
import { GroupAvatar, GroupBanner } from './GroupAvatar';
import { GROUP_IMAGE_ACCEPT, groupImageError } from '../../utils/groupImage';

interface GroupAppearanceModalProps {
  group: GroupResponse | null;
  onClose: () => void;
  onSave: (payload: GroupAppearance) => Promise<unknown>;
}

const COLOR_NAMES: Record<string, string> = {
  '#ffd25e': 'Amarillo Lumi',
  '#3ee6a8': 'Menta',
  '#ff6fb5': 'Chicle',
  '#59c3ff': 'Celeste',
  '#a597ff': 'Lavanda',
  '#ff8a5c': 'Coral',
};


type Slot = 'icon' | 'banner';

export const GroupAppearanceModal: React.FC<GroupAppearanceModalProps> = ({ group, onClose, onSave }) => {
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Slot | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const iconInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!group) return;
    setColor(groupColor(group));
    setIconUrl(group.iconUrl ?? null);
    setBannerUrl(group.bannerUrl ?? null);
  }, [group]);

  if (!group) return null;
  const preview = { ...group, color, iconUrl, bannerUrl };

  const upload = async (slot: Slot, file: File | undefined) => {
    if (!file) return;
    const invalid = groupImageError(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(slot);
    try {
      const { url } = await documentService.uploadFile(file);
      if (slot === 'icon') setIconUrl(url);
      else setBannerUrl(url);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(null);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ color, iconUrl, bannerUrl });
      toast.success('Grupo personalizado');
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Personaliza tu grupo" size="xl">
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={(event) => void save(event)} className="flex flex-col gap-6">
          <p className="-mt-2 text-[15px] text-slate-600">La foto y la portada ayudan a que tus compañeros lo encuentren rápido.</p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => iconInput.current?.click()}
              aria-label="Cambiar la foto del grupo"
              className="relative shrink-0"
            >
              <GroupAvatar group={preview} size={84} radius={28} />
              <span className="absolute -right-1.5 -bottom-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white ring-4 ring-[var(--eq-raised)]">
                <Plus size={16} />
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Foto del grupo</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => iconInput.current?.click()}
                  disabled={uploading !== null}
                  className="h-10 rounded-full bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {uploading === 'icon' ? 'Subiendo...' : 'Subir imagen'}
                </button>
                {iconUrl && (
                  <button
                    type="button"
                    onClick={() => setIconUrl(null)}
                    className="h-10 rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-800 hover:bg-slate-200"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">PNG o JPG, mínimo 256 × 256. Se recorta en forma de squircle.</p>
              <input
                ref={iconInput}
                type="file"
                accept={GROUP_IMAGE_ACCEPT}
                className="sr-only"
                aria-label="Elegir la foto del grupo"
                onChange={(event) => {
                  void upload('icon', event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-slate-900">Portada</p>
            <button
              type="button"
              onClick={() => bannerInput.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void upload('banner', event.dataTransfer.files?.[0]);
              }}
              disabled={uploading !== null}
              className={`flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-sm font-semibold transition disabled:opacity-60 ${
                dragging ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-300 text-slate-500 hover:border-indigo-400'
              }`}
            >
              <ImagePlus size={20} />
              {uploading === 'banner' ? 'Subiendo...' : 'Arrastra una imagen de 960 × 320 o haz clic'}
            </button>
            {bannerUrl && (
              <button type="button" onClick={() => setBannerUrl(null)} className="mt-2 text-xs font-semibold text-slate-500 hover:text-red-500">
                Quitar portada
              </button>
            )}
            <input
              ref={bannerInput}
              type="file"
              accept={GROUP_IMAGE_ACCEPT}
              className="sr-only"
              aria-label="Elegir la portada del grupo"
              onChange={(event) => {
                void upload('banner', event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-slate-900">Color del grupo (si no hay foto)</legend>
            <div className="flex flex-wrap gap-2.5">
              {GROUP_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={COLOR_NAMES[option] ?? option}
                  aria-pressed={color === option}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-noche transition ${
                    color === option ? 'ring-2 ring-ink ring-offset-2 ring-offset-[var(--eq-raised)]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: option }}
                >
                  {color === option && <Check size={18} />}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex justify-end gap-2">
            <button type="button" onClick={onClose} className="h-11 rounded-full px-5 text-sm font-bold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading !== null}
              className="h-11 rounded-full bg-mint px-6 text-sm font-bold text-noche hover:brightness-105 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-3 rounded-2xl bg-side p-5">
          <p className="text-xs font-bold text-slate-500">Vista previa</p>
          <div className="overflow-hidden rounded-2xl bg-canvas">
            <GroupBanner group={preview} className="h-28" />
            <div className="px-4 pb-4">
              <GroupAvatar group={preview} size={64} radius={22} className="relative -mt-8 ring-[5px] ring-[var(--eq-canvas)]" />
              <p className="mt-2 text-lg font-extrabold text-slate-900">{group.name}</p>
              <p className="text-sm text-slate-500">
                {group.memberCount === 1 ? '1 integrante' : `${group.memberCount} integrantes`} ·{' '}
                {group.visibility === 'PRIVATE' ? 'Privado' : 'Público'}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">En la barra de grupos</p>
          <div className="flex gap-2.5 self-start rounded-2xl bg-rail p-3">
            <GroupAvatar group={preview} size={48} radius={16} />
            <span className="h-12 w-12 rounded-3xl bg-mint" aria-hidden="true" />
            <span className="h-12 w-12 rounded-3xl bg-chicle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Modal>
  );
};
