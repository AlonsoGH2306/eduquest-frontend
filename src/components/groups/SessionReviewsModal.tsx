import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { StarRating } from '../common/StarRating';
import { UserAvatar } from '../common/UserAvatar';
import { Spinner } from '../common/Spinner';
import { groupService } from '../../services/groupService';
import { useFetch } from '../../hooks/useFetch';
import { SessionReviewRequest, StudySessionResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/formatDate';

interface SessionReviewsModalProps {
  groupId: number;
  session: StudySessionResponse | null;
  onClose: () => void;
  onSubmitReview: (session: StudySessionResponse, payload: SessionReviewRequest) => Promise<unknown>;
}

const ReviewsBody: React.FC<Omit<SessionReviewsModalProps, 'session'> & { session: StudySessionResponse }> = ({
  groupId,
  session,
  onClose,
  onSubmitReview,
}) => {
  const fetchReviews = useCallback(
    (signal: AbortSignal) => groupService.getSessionReviews(groupId, session.id, signal),
    [groupId, session.id]
  );
  const { data: reviews, loading, error } = useFetch(fetchReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      toast.error('Elige de 1 a 5 estrellas');
      return;
    }
    setSending(true);
    try {
      await onSubmitReview(session, { rating, comment: comment.trim() });
      toast.success('¡Gracias por calificar la asesoría!');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      {session.canReview && (
        <form onSubmit={submit} className="space-y-3 rounded-xl bg-amber-50/60 p-4">
          <p className="text-sm font-semibold text-slate-800">¿Qué tal estuvo la asesoría?</p>
          <StarRating value={rating} onChange={setRating} size={24} />
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={500}
            rows={3}
            aria-label="Comentario"
            placeholder="Cuéntale al grupo qué te sirvió (opcional)"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={14} /> {sending ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner size={22} label="Cargando reseñas..." />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !reviews || reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Todavía nadie calificó esta asesoría.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
              <UserAvatar username={review.authorUsername} avatarUrl={review.authorAvatarUrl} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">@{review.authorUsername}</span>
                  <StarRating value={review.rating} size={13} />
                </div>
                {review.comment && <p className="mt-1 text-sm text-slate-600">{review.comment}</p>}
                <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(review.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const SessionReviewsModal: React.FC<SessionReviewsModalProps> = ({ session, ...props }) => (
  <Modal isOpen={Boolean(session)} onClose={props.onClose} title={session ? `Reseñas · ${session.title}` : ''}>
    {session && <ReviewsBody session={session} {...props} />}
  </Modal>
);
