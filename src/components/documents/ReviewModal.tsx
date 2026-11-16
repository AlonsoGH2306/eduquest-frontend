import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CalendarDays, Pencil, Send, Star, Trash2, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { ConfirmModal } from '../common/ConfirmModal';
import { DocumentResponse, ReviewResponse } from '../../types';
import { useReviews } from '../../hooks/useReviews';
import { extractErrorMessage } from '../../utils/errors';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/formatDate';

interface ReviewFormValues {
  rating: number;
  comment: string;
}

interface ReviewModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ document, onClose }) => {
  const { user } = useAuth();
  const { reviews, loading, error, reload, averageRating, addReview, editReview, removeReview } = useReviews(
    document?.id ?? null
  );
  const [editingReview, setEditingReview] = useState<ReviewResponse | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: { rating: 5, comment: '' },
  });

  if (!document) return null;

  const startEditing = (review: ReviewResponse) => {
    setEditingReview(review);
    reset({ rating: review.rating, comment: review.comment ?? '' });
  };

  const cancelEditing = () => {
    setEditingReview(null);
    reset({ rating: 5, comment: '' });
  };

  const handleClose = () => {
    cancelEditing();
    onClose();
  };

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      if (editingReview) {
        await editReview(editingReview.id, {
          rating: Number(values.rating),
          comment: values.comment.trim(),
        });
        cancelEditing();
        toast.success('Reseña actualizada');
        return;
      }

      await addReview(Number(values.rating), values.comment.trim());
      reset({ rating: 5, comment: '' });
      toast.success('¡Reseña publicada!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);
    try {
      await removeReview(reviewToDelete.id);
      if (editingReview?.id === reviewToDelete.id) cancelEditing();
      toast.success('Reseña eliminada');
      setReviewToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const ownReview = reviews.find((review) => review.authorUsername === user?.username);

  return (
    <>
    <Modal isOpen={Boolean(document)} onClose={handleClose} title={`Reseñas: ${document.title}`}>
      <div className="space-y-5">
        {averageRating !== null && (
          <p className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <strong className="text-slate-900">{averageRating.toFixed(1)}</strong> de 5 · {reviews.length}{' '}
            {reviews.length === 1 ? 'reseña' : 'reseñas'}
          </p>
        )}
        {ownReview && !editingReview ? (
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
            Ya dejaste tu reseña para este documento. Puedes editarla o eliminarla desde la lista.
          </p>
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-700">
              {editingReview ? 'Editando tu reseña' : 'Deja tu reseña'}
            </p>
            {editingReview && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                <X size={12} /> Cancelar edición
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Calificación (1 a 5)</label>
            <select
              {...register('rating', { required: true })}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-600"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)} ({n}/5)
                </option>
              ))}
            </select>
          </div>

          <div>
            <textarea
              rows={2}
              placeholder="¿Qué te pareció este material de estudio?"
              {...register('comment', {
                required: 'Escribe un comentario breve',
                maxLength: { value: 500, message: 'Máximo 500 caracteres' },
              })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {editingReview ? <Pencil size={12} /> : <Send size={12} />}
              {isSubmitting
                ? 'Guardando...'
                : editingReview
                  ? 'Guardar cambios'
                  : 'Publicar Reseña'}
            </button>
          </div>
        </form>
        )}

        <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
          {loading ? (
            <Spinner size={22} label="Cargando reseñas..." />
          ) : error ? (
            <p className="py-4 text-center text-xs text-red-600">
              {error}{' '}
              <button type="button" onClick={reload} className="font-semibold underline">
                Reintentar
              </button>
            </p>
          ) : reviews.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-500">
              Aún no hay reseñas para este documento. ¡Sé el primero en opinar!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl border border-slate-200 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">@{rev.authorUsername}</span>
                    {rev.createdAt && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                        <CalendarDays size={10} /> {formatDateTime(rev.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 font-bold text-amber-500">
                      <Star size={12} fill="currentColor" /> {rev.rating}/5
                    </span>
                    {user?.username === rev.authorUsername && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(rev)}
                          title="Editar mi reseña"
                          aria-label="Editar mi reseña"
                          className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(rev)}
                          title="Eliminar mi reseña"
                          aria-label="Eliminar mi reseña"
                          className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-slate-600">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
    <ConfirmModal
      isOpen={reviewToDelete !== null}
      title="Eliminar reseña"
      message="Tu reseña y su calificación desaparecerán de este documento. No se puede deshacer."
      confirmLabel="Eliminar"
      loadingLabel="Eliminando..."
      destructive
      loading={deleting}
      icon={<Trash2 size={14} />}
      onConfirm={confirmDelete}
      onClose={() => setReviewToDelete(null)}
    />
    </>
  );
};