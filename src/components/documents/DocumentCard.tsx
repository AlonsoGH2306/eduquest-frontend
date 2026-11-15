import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Eye,
  Flag,
  FileText,
  GraduationCap,
  MessageSquarePlus,
  School,
  Tag,
  User,
} from 'lucide-react';
import { DocumentResponse } from '../../types';
import { formatDateTime } from '../../utils/formatDate';
import { extractErrorMessage } from '../../utils/errors';
import { useSavedDocuments } from '../../hooks/useSavedDocuments';
import { useAuth } from '../../hooks/useAuth';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ReportModal } from '../reports/ReportModal';

interface DocumentCardProps {
  document: DocumentResponse;
  onOpenReviews: (doc: DocumentResponse) => void;
  onTagClick?: (tag: string) => void;
  onSavedChange?: (doc: DocumentResponse, saved: boolean) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpenReviews, onTagClick, onSavedChange }) => {
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedDocuments();
  const [previewing, setPreviewing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const saved = isSaved(document.id);
  const isMine = user?.username === document.authorUsername;

  const onToggleSave = async () => {
    try {
      const nowSaved = await toggleSaved(document.id);
      toast.success(nowSaved ? 'Guardado en tus favoritos' : 'Quitado de tus favoritos');
      onSavedChange?.(document, nowSaved);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-indigo-600">
            <div className="rounded-lg bg-indigo-50 p-2">
              <FileText size={18} />
            </div>
            <span className="truncate text-xs font-semibold text-indigo-700">
              {document.groupName ? `Grupo: ${document.groupName}` : 'Público'}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Quitar de guardados' : 'Guardar documento'}
            title={saved ? 'Quitar de guardados' : 'Guardar'}
            className={`rounded-lg p-1.5 transition ${
              saved ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        <h3 className="line-clamp-1 text-base font-bold text-slate-900" title={document.title}>
          {document.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
          {document.description || 'Sin descripción adicional.'}
        </p>

        {(document.course || document.university) && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
            {document.course && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-violet-700">
                <GraduationCap size={11} /> {document.course}
              </span>
            )}
            {document.university && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                <School size={11} /> {document.university}
              </span>
            )}
          </div>
        )}

        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <User size={11} /> {document.authorUsername}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={11} /> {formatDateTime(document.uploadedAt) || 'fecha desconocida'}
          </span>
        </p>

        {document.tags && document.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {document.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenReviews(document)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <MessageSquarePlus size={14} /> Reseñas
          </button>
          {!isMine && (
            <button
              type="button"
              onClick={() => setReporting(true)}
              aria-label="Reportar material"
              title="Reportar"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Flag size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
        >
          <Eye size={13} /> Ver material
        </button>
      </div>

      <DocumentPreviewModal document={previewing ? document : null} onClose={() => setPreviewing(false)} />
      <ReportModal
        target={reporting ? { type: 'DOCUMENT', id: document.id, label: document.title } : null}
        onClose={() => setReporting(false)}
      />
    </div>
  );
};
