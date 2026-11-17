import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FileUp, Link2, Paperclip, Save, Upload, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentRequest, DocumentResponse } from '../../types';
import { documentService } from '../../services/documentService';
import { isUploadedFile } from '../../utils/documentPreview';
import { extractErrorMessage } from '../../utils/errors';

interface FormValues {
  title: string;
  description: string;
  fileUrl: string;
  tagsInput: string;
  course: string;
  university: string;
}

type SourceMode = 'file' | 'link';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDocument: (payload: DocumentRequest) => Promise<void>;
  modalTitle?: string;
  initialDocument?: DocumentResponse | null;
}

const MAX_FILE_MB = 10;
const ACCEPTED_FILES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp';
const EMPTY_VALUES: FormValues = { title: '', description: '', fileUrl: '', tagsInput: '', course: '', university: '' };

const valuesFrom = (document?: DocumentResponse | null): FormValues =>
  document
    ? {
        title: document.title,
        description: document.description ?? '',
        fileUrl: document.fileUrl,
        tagsInput: document.tags?.join(', ') ?? '',
        course: document.course ?? '',
        university: document.university ?? '',
      }
    : EMPTY_VALUES;

const fileNameFromUrl = (url: string) => decodeURIComponent(url.split('?')[0].split('/').pop() ?? 'archivo');

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitDocument,
  modalTitle = 'Subir Documento a la Biblioteca',
  initialDocument = null,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange', defaultValues: EMPTY_VALUES });

  const [mode, setMode] = useState<SourceMode>('file');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUrl = watch('fileUrl');
  const editing = initialDocument !== null;

  useEffect(() => {
    if (!isOpen) return;
    reset(valuesFrom(initialDocument));
    setMode(initialDocument && !isUploadedFile(initialDocument.fileUrl) ? 'link' : 'file');
    setProgress(0);
  }, [isOpen, initialDocument, reset]);

  const changeMode = (next: SourceMode) => {
    if (next === mode) return;
    setMode(next);
    setValue('fileUrl', initialDocument && (next === 'file') === isUploadedFile(initialDocument.fileUrl) ? initialDocument.fileUrl : '', {
      shouldValidate: false,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const block = (event: DragEvent) => event.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, [isOpen]);

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void uploadFile(file);
  };

  const onDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !uploading) void uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`El archivo no debe superar los ${MAX_FILE_MB} MB`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await documentService.uploadFile(file, setProgress);
      setValue('fileUrl', uploaded.url, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    const tags = values.tagsInput
      ? values.tagsInput
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    try {
      await onSubmitDocument({
        title: values.title.trim(),
        description: values.description?.trim() ?? '',
        fileUrl: values.fileUrl.trim(),
        tags,
        course: values.course?.trim() || undefined,
        university: values.university?.trim() || undefined,
      });
      reset(EMPTY_VALUES);
      onClose();
    } catch {
      return;
    }
  };

  const modeButton = (value: SourceMode, label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => changeMode(value)}
      aria-pressed={mode === value}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        mode === value ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar material' : modalTitle}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="document-title" className="block text-xs font-semibold text-slate-700">
            Título del material
          </label>
          <input
            id="document-title"
            type="text"
            placeholder="Ej. Resumen Cálculo II - Integrales Múltiples"
            {...register('title', {
              validate: (value) => value.trim().length > 0 || 'El título es obligatorio',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="document-description" className="block text-xs font-semibold text-slate-700">
            Descripción
          </label>
          <textarea
            id="document-description"
            rows={3}
            placeholder="Describe brevemente el contenido del documento o ejercicios resueltos..."
            {...register('description')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold text-slate-700">Archivo</span>
          <div className="mt-1 flex gap-1 rounded-xl bg-slate-100 p-1">
            {modeButton('file', 'Subir desde mi equipo', FileUp)}
            {modeButton('link', 'Pegar un enlace', Link2)}
          </div>

          <input
            type="hidden"
            {...register('fileUrl', {
              validate: (value) => {
                if (!value.trim()) return mode === 'file' ? 'Sube un archivo' : 'La URL del archivo es obligatoria';
                return /^https?:\/\/.+/.test(value.trim()) || 'La URL debe comenzar con http:// o https://';
              },
            })}
          />

          {mode === 'file' ? (
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_FILES}
                onChange={onFileSelected}
                className="sr-only"
                id="document-file"
              />
              {fileUrl && isUploadedFile(fileUrl) && !uploading ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  <Paperclip size={14} />
                  <span className="min-w-0 flex-1 truncate font-semibold">{fileNameFromUrl(fileUrl)}</span>
                  <button
                    type="button"
                    onClick={() => setValue('fileUrl', '', { shouldValidate: true })}
                    aria-label="Quitar archivo"
                    className="rounded-md p-1 hover:bg-white/60"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="document-file"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/60 ${
                    dragging ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-300'
                  }`}
                >
                  <FileUp size={22} className="text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    {uploading ? `Subiendo... ${progress}%` : dragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo o haz clic para elegirlo'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    PDF, Word, PowerPoint, Excel, texto o imagen · máximo {MAX_FILE_MB} MB
                  </span>
                  {uploading && (
                    <span className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                      <span className="block h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                    </span>
                  )}
                </label>
              )}
            </div>
          ) : (
            <input
              type="url"
              aria-label="Enlace del archivo"
              placeholder="https://drive.google.com/file/..."
              value={fileUrl}
              onChange={(event) => setValue('fileUrl', event.target.value, { shouldValidate: true, shouldDirty: true })}
              className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
          )}
          {errors.fileUrl && <p className="mt-1 text-xs text-red-600">{errors.fileUrl.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="document-course" className="block text-xs font-semibold text-slate-700">
              Curso (opcional)
            </label>
            <input
              id="document-course"
              type="text"
              placeholder="Cálculo I"
              {...register('course', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.course && <p className="mt-1 text-xs text-red-600">{errors.course.message}</p>}
          </div>
          <div>
            <label htmlFor="document-university" className="block text-xs font-semibold text-slate-700">
              Universidad o colegio (opcional)
            </label>
            <input
              id="document-university"
              type="text"
              placeholder="UTEC"
              {...register('university', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.university && <p className="mt-1 text-xs text-red-600">{errors.university.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="document-tags" className="block text-xs font-semibold text-slate-700">
            Etiquetas separadas por coma (opcional)
          </label>
          <input
            id="document-tags"
            type="text"
            placeholder="calculo, examen, parcial, algoritmos"
            {...register('tagsInput')}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {editing ? <Save size={14} /> : <Upload size={14} />}
            {isSubmitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Publicar Documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
