import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, EyeOff, X } from 'lucide-react';
import { DocumentResponse } from '../../types';
import { buildDocumentPreview, FileKind, isUploadedFile } from '../../utils/documentPreview';
import { Spinner } from '../common/Spinner';

const BADGES: Record<FileKind, { label: string; className: string }> = {
  pdf: { label: 'PDF', className: 'bg-red-500' },
  doc: { label: 'DOC', className: 'bg-blue-500' },
  slides: { label: 'PPT', className: 'bg-amber-500' },
  sheet: { label: 'XLS', className: 'bg-emerald-600' },
  image: { label: 'IMG', className: 'bg-violet-500' },
  video: { label: 'VID', className: 'bg-red-600' },
  link: { label: 'URL', className: 'bg-slate-500' },
};

interface DocumentPreviewModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
}

const embedsPdf = () => typeof navigator === 'undefined' || navigator.pdfViewerEnabled !== false;

const useLocalCopy = (url: string | null) => {
  const [state, setState] = useState<{ src: string | null; failed: boolean }>({ src: null, failed: false });

  useEffect(() => {
    setState({ src: null, failed: false });
    if (!url) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const type = blob.type && blob.type !== 'application/octet-stream' ? blob.type : 'application/pdf';
        objectUrl = URL.createObjectURL(new Blob([blob], { type }));
        setState({ src: objectUrl, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ src: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return state;
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document: doc, onClose }) => {
  const [loaded, setLoaded] = useState(false);
  const preview = doc ? buildDocumentPreview(doc.fileUrl, doc.title) : null;
  const servedLocally = Boolean(doc && preview?.kind === 'iframe' && isUploadedFile(doc.fileUrl) && preview.src === doc.fileUrl);
  const canEmbed = !servedLocally || preview?.fileKind !== 'pdf' || embedsPdf();
  const localCopy = useLocalCopy(servedLocally && canEmbed && doc ? doc.fileUrl : null);

  useEffect(() => {
    if (!doc) return;
    setLoaded(false);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.document.addEventListener('keydown', handleKey);
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    return () => {
      window.document.removeEventListener('keydown', handleKey);
      window.document.body.style.overflow = previousOverflow;
    };
  }, [doc, onClose]);

  if (!doc || !preview) return null;
  const localSrc = localCopy.src && preview.fileKind === 'pdf' ? `${localCopy.src}#toolbar=0&navpanes=0&zoom=100` : localCopy.src;
  const frameSrc = servedLocally ? localSrc : preview.src;
  const unavailable = !canEmbed || localCopy.failed;
  const badge = BADGES[preview.fileKind];
  const subtitle = [doc.authorUsername && `@${doc.authorUsername}`, doc.course, doc.university].filter(Boolean).join(' · ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${doc.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-[#1f1f1f] text-white"
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold ${badge.className}`}>
          {badge.label}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold sm:text-lg">{doc.title}</h2>
          {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
        </div>

        {preview.downloadUrl && (
          <a
            href={preview.downloadUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#a8c7fa] px-4 py-2 text-sm font-semibold text-[#062e6f] transition hover:bg-[#c2d7fb]"
          >
            <Download size={16} /> <span className="hidden sm:inline">Descargar</span>
          </a>
        )}
        <a
          href={preview.openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">{preview.source === 'drive' ? 'Abrir en Drive' : 'Abrir'}</span>
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista previa"
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <X size={22} />
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {preview.kind === 'iframe' && unavailable ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <EyeOff size={36} className="text-white/50" />
            <p className="text-base font-semibold">
              {canEmbed ? 'No se pudo cargar el archivo' : 'Tu navegador no muestra PDF dentro de la página'}
            </p>
            <p className="max-w-md text-sm text-white/60">Usa “Abrir” para verlo en una pestaña nueva o descárgalo.</p>
          </div>
        ) : preview.kind === 'iframe' ? (
          <>
            {(!loaded || !frameSrc) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner size={32} label="Cargando el material..." />
              </div>
            )}
            {frameSrc && (
              <iframe
                src={frameSrc}
                title={`Vista previa de ${doc.title}`}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full border-0 transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
                allow="autoplay; fullscreen"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            )}
          </>
        ) : preview.kind === 'image' ? (
          <div className="flex h-full items-center justify-center overflow-auto p-6">
            <img src={preview.src} alt={doc.title} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <EyeOff size={36} className="text-white/50" />
            <p className="text-base font-semibold">Este enlace no se puede previsualizar aquí</p>
            <p className="max-w-md text-sm text-white/60">
              Funciona con PDF, documentos de Office, imágenes, Google Drive y YouTube. Usa “Abrir” para verlo en una
              pestaña nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
