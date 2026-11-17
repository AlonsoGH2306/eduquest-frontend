import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Send, Star } from 'lucide-react';
import { Modal } from '../common/Modal';
import { StarRating } from '../common/StarRating';
import { UserAvatar } from '../common/UserAvatar';
import { Spinner } from '../common/Spinner';
import { groupService } from '../../services/groupService';
import { useFetch } from '../../hooks/useFetch';
import { SessionReviewRequest, StudySessionResponse } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { formatDateTime } from '../../utils/formatDate';
import { inputClass } from '../../utils/forms';
import { Lumi } from '../brand/Lumi';

const RATING_LABELS = ['No me sirvió', 'Podría mejorar', 'Estuvo bien', '¡Muy buena!', '¡Excelente!'];

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
  const [hovered, setHovered] = useState(0);

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

  const average = session.averageRating ?? (reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null);
  const shown = hovered || rating;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lumi/15 text-lumi-ink">
          <CalendarClock size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{session.title}</p>
          <p className="truncate text-xs text-slate-500">
            {session.createdByUsername ? `Dictó @${session.createdByUsername} · ` : ''}
            {formatDateTime(session.scheduledAt)}
          </p>
        </div>
        {average !== null && (
          <div className="shrink-0 text-right">
            <p className="font-display text-xl leading-none text-lumi-ink">{average.toFixed(1)}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {session.reviewCount || reviews?.length || 0} reseña{(session.reviewCount || reviews?.length || 0) === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      {session.canReview && (
        <form onSubmit={submit} className="rounded-3xl bg-slate-50 p-5">
          <div className="flex flex-col items-center text-center">
            <Lumi mood={shown >= 4 ? 'cheer' : shown > 0 && shown <= 2 ? 'sleepy' : 'happy'} size={56} />
            <p className="mt-2 text-base font-bold text-slate-900">¿Qué tal estuvo la asesoría?</p>
            <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHovered(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  className="rounded-xl p-1 transition hover:scale-110"
                >
                  <Star
                    size={34}
                    strokeWidth={1.8}
                    className={star <= shown ? 'fill-lumi text-lumi' : 'text-slate-300'}
                  />
                </button>
              ))}
            </div>
            <p className="mt-1 h-5 text-sm font-semibold text-lumi-ink">{shown > 0 ? RATING_LABELS[shown - 1] : ''}</p>
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={500}
            rows={3}
            aria-label="Comentario"
            placeholder="Cuéntale al grupo qué te sirvió (opcional)"
            className={`${inputClass(false)} resize-none`}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{comment.length}/500</span>
            <button
              type="submit"
              disabled={sending || rating === 0}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={15} /> {sending ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </div>
        </form>
      )}

      <section>
        {(loading || error || (reviews && reviews.length > 0)) && (
          <h3 className="mb-2 text-sm font-bold text-slate-800">Lo que dijo el grupo</h3>
        )}
        {loading ? (
          <Spinner size={22} label="Cargando reseñas..." />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !reviews || reviews.length === 0 ? (
          !session.canReview && (
            <div className="flex flex-col items-center py-4 text-center">
              <Lumi mood="sleepy" size={48} />
              <p className="mt-2 text-sm text-slate-500">Todavía nadie calificó esta asesoría.</p>
            </div>
          )
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <UserAvatar username={review.authorUsername} avatarUrl={review.authorAvatarUrl} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800">@{review.authorUsername}</span>
                    <StarRating value={review.rating} size={13} />
                  </div>
                  {review.comment && <p className="mt-1 text-sm break-words text-slate-600">{review.comment}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(review.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export const SessionReviewsModal: React.FC<SessionReviewsModalProps> = ({ session, ...props }) => (
  <Modal isOpen={Boolean(session)} onClose={props.onClose} title="Reseñas de la asesoría">
    {session && <ReviewsBody session={session} {...props} />}
  </Modal>
);
