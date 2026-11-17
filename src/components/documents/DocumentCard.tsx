import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Pencil,
  School,
  Sparkles,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { DocumentRequest, DocumentResponse } from '../../types';
import { documentService } from '../../services/documentService';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/formatDate';
import { extractErrorMessage } from '../../utils/errors';
import { useSavedDocuments } from '../../hooks/useSavedDocuments';
import { useAuth } from '../../hooks/useAuth';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { StudySetModal } from './StudySetModal';
import { ReportModal } from '../reports/ReportModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmModal } from '../common/ConfirmModal';

interface DocumentCardProps {
  document: DocumentResponse;
  onOpenReviews: (doc: DocumentResponse) => void;
  onTagClick?: (tag: string) => void;
  onSavedChange?: (doc: DocumentResponse, saved: boolean) => void;
  onChanged?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onOpenReviews,
  onTagClick,
  onSavedChange,
  onChanged,
}) => {
  const { user, isAdmin, canManageUsers: isModerator } = useAuth();
  const { isSaved, toggleSaved } = useSavedDocuments();
  const [previewing, setPreviewing] = useState(false);
  const [studying, setStudying] = useState(false);
  const [reporting, setReporting] = useState(false);
  const saved = isSaved(document.id);
  const isMine = user?.username === document.authorUsername;
  const canEdit = isMine || isAdmin;
  const canDelete = canEdit || isModerator;
  const canFeature = isModerator && !document.groupName;
  const [featuring, setFeaturing] = useState(false);

  const toggleFeatured = async () => {
    setFeaturing(true);
    try {
      const updated = await adminService.setFeatured(document.id, !document.featured);
      toast.success(updated.featured ? 'Material destacado en la biblioteca' : 'Ya no está destacado');
      onChanged?.();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setFeaturing(false);
    }
  };
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const saveChanges = async (payload: DocumentRequest) => {
    try {
      await documentService.updateDocument(document.id, payload);
      toast.success('Material actualizado');
      onChanged?.();
    } catch (error) {
      toast.error(extractErrorMessage(error));
      throw error;
    }
  };

  const deleteDocument = async () => {
    setDeleting(true);
    try {
      if (canEdit) await documentService.deleteDocument(document.id);
      else await adminService.deleteDocument(document.id);
      toast.success('Material eliminado');
      setConfirmingDelete(false);
      onChanged?.();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

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
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 text-indigo-600">
            <div className="rounded-lg bg-indigo-50 p-2">
              <FileText size={18} />
            </div>
            <span className="truncate text-xs font-semibold text-indigo-700">
              {document.groupName ? `Grupo: ${document.groupName}` : 'Público'}
            </span>
            {document.featured && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Sparkles size={11} /> Destacado
              </span>
            )}
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
          {document.authorId ? (
            <Link
              to={`/users/${document.authorId}`}
              className="inline-flex items-center gap-1 transition hover:text-indigo-600 hover:underline"
            >
              <User size={11} /> {document.authorUsername}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1">
              <User size={11} /> {document.authorUsername}
            </span>
          )}
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

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <Eye size={15} /> Ver
        </button>
        <button
          type="button"
          onClick={() => setStudying(true)}
          title="Quiz y flashcards con IA"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          <GraduationCap size={15} /> Estudiar
        </button>
        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={() => onOpenReviews(document)}
            aria-label="Reseñas"
            title="Reseñas"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <MessageSquarePlus size={16} />
          </button>
          {canFeature && (
            <button
              type="button"
              onClick={toggleFeatured}
              disabled={featuring}
              aria-pressed={Boolean(document.featured)}
              aria-label={document.featured ? 'Quitar de destacados' : 'Destacar material'}
              title={document.featured ? 'Quitar de destacados' : 'Destacar'}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-50 ${
                document.featured ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <Sparkles size={16} />
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Editar material"
              title="Editar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <Pencil size={16} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Eliminar material"
              title="Eliminar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}
          {!isMine && (
            <button
              type="button"
              onClick={() => setReporting(true)}
              aria-label="Reportar material"
              title="Reportar"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Flag size={16} />
            </button>
          )}
        </div>
      </div>

      <DocumentPreviewModal document={previewing ? document : null} onClose={() => setPreviewing(false)} />
      {canDelete && (
        <>
          <DocumentUploadModal
            isOpen={editing}
            onClose={() => setEditing(false)}
            onSubmitDocument={saveChanges}
            initialDocument={document}
          />
          <ConfirmModal
            isOpen={confirmingDelete}
            title="Eliminar material"
            message={
              <>
                «<span className="font-semibold text-slate-900">{document.title}</span>» y sus reseñas se borrarán para
                todos. Esta acción no se puede deshacer.
              </>
            }
            confirmLabel="Eliminar"
            loadingLabel="Eliminando..."
            destructive
            loading={deleting}
            icon={<Trash2 size={14} />}
            onConfirm={deleteDocument}
            onClose={() => setConfirmingDelete(false)}
          />
        </>
      )}
      <StudySetModal document={studying ? document : null} onClose={() => setStudying(false)} />
      <ReportModal
        target={reporting ? { type: 'DOCUMENT', id: document.id, label: document.title } : null}
        onClose={() => setReporting(false)}
      />
    </div>
  );
};
