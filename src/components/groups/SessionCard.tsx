import React from 'react';
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  Pencil,
  CirclePlay,
  Star,
  Trash2,
  Users,
  Video,
  MonitorPlay,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { StudySessionResponse } from '../../types';
import { buildGoogleCalendarUrl } from '../../utils/calendar';
import { formatDateTime } from '../../utils/formatDate';
import { AdvisorBadge } from '../common/AdvisorBadge';

interface SessionCardProps {
  session: StudySessionResponse;
  busy?: boolean;
  onEdit: (session: StudySessionResponse) => void;
  onDelete: (session: StudySessionResponse) => void;
  onToggleAttendance: (session: StudySessionResponse) => void;
  onCheckIn: (session: StudySessionResponse) => void;
  onOpenReviews: (session: StudySessionResponse) => void;
  onEditRecording: (session: StudySessionResponse) => void;
  onWatchRecording: (session: StudySessionResponse) => void;
}

const secondaryButton =
  'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700';

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  busy = false,
  onEdit,
  onDelete,
  onToggleAttendance,
  onCheckIn,
  onOpenReviews,
  onEditRecording,
  onWatchRecording,
}) => {
  const upcoming = !session.finished;
  const live = session.checkInOpen;
  const endTime = new Date(session.endsAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const joinNow = () => {
    if (session.meetingUrl) window.open(session.meetingUrl, '_blank', 'noopener,noreferrer');
    if (!session.checkedIn) onCheckIn(session);
  };

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs ${
        upcoming ? 'border-slate-200' : 'border-slate-200/70 bg-slate-50/60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-600">
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {formatDateTime(session.scheduledAt)} – {endTime}
            {!upcoming && <span className="font-medium text-slate-400"> · finalizada</span>}
            {live && session.started && (
              <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                En curso
              </span>
            )}
          </span>
          {session.canManage && (
            <span className="flex items-center gap-1">
              {!session.started && (
                <button
                  type="button"
                  onClick={() => onEdit(session)}
                  aria-label={`Editar ${session.title}`}
                  title="Editar sesión"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(session)}
                aria-label={`Eliminar ${session.title}`}
                title="Eliminar sesión"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </span>
          )}
        </div>
        <h3 className="mt-2 text-base font-bold text-slate-900">{session.title}</h3>
        {session.createdByUsername && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            Dicta @{session.createdByUsername}
            {session.createdByAdvisor && <AdvisorBadge />}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-600">{session.description || 'Sesión sincrónica de estudio grupal.'}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Users size={13} /> {session.attendeeCount} {session.attendeeCount === 1 ? 'confirmado' : 'confirmados'}
          </span>
          {session.started && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <UserCheck size={13} /> {session.checkedInCount} {session.checkedInCount === 1 ? 'asistió' : 'asistieron'}
            </span>
          )}
          {session.reviewCount > 0 && session.averageRating !== null && (
            <button
              type="button"
              onClick={() => onOpenReviews(session)}
              className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:underline"
            >
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {session.averageRating.toFixed(1)} ({session.reviewCount})
            </button>
          )}
          {session.recordingVideoId && (
            <span className="inline-flex items-center gap-1 text-red-600">
              <MonitorPlay size={13} /> Grabación disponible
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
        {live ? (
          <>
            {session.checkedIn ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} /> Asistencia registrada
              </span>
            ) : (
              session.attending && (
                <span className="self-center text-[11px] text-slate-500">Confirmaste: entra para no perder puntos</span>
              )
            )}
            <button
              type="button"
              onClick={joinNow}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {session.checkedIn ? <Video size={14} /> : <LogIn size={14} />}
              {session.checkedIn ? 'Volver a la llamada' : 'Unirme ahora'}
            </button>
          </>
        ) : upcoming ? (
          <>
            <button
              type="button"
              onClick={() => onToggleAttendance(session)}
              disabled={busy}
              aria-pressed={session.attending}
              className={
                session.attending
                  ? 'inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50'
                  : `${secondaryButton} disabled:opacity-50`
              }
            >
              <CheckCircle2 size={14} /> {session.attending ? 'Asistirás' : 'Confirmar asistencia'}
            </button>
            <a href={buildGoogleCalendarUrl(session)} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
              <CalendarPlus size={14} /> Google Calendar
            </a>
          </>
        ) : (
          <>
            {session.canManage && (
              <button type="button" onClick={() => onEditRecording(session)} className={secondaryButton}>
                <MonitorPlay size={14} /> {session.recordingUrl ? 'Cambiar grabación' : 'Adjuntar grabación'}
              </button>
            )}
            {(session.canReview || session.reviewCount > 0) && (
              <button
                type="button"
                onClick={() => onOpenReviews(session)}
                className={
                  session.canReview
                    ? 'inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-600'
                    : secondaryButton
                }
              >
                <Star size={14} /> {session.canReview ? 'Calificar asesoría' : 'Ver reseñas'}
              </button>
            )}
            {session.recordingVideoId && (
              <button
                type="button"
                onClick={() => onWatchRecording(session)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                <CirclePlay size={14} /> Ver grabación
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
};
