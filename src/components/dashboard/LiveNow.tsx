import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Headphones, Timer } from 'lucide-react';
import { StudySessionResponse, UserSummary } from '../../types';
import { LiveGroupState } from '../../hooks/useLiveActivity';
import { clockOffset, formatCountdown, phaseOf } from '../../utils/studyRoom';
import { UserAvatar } from '../common/UserAvatar';
import { Lumi } from '../brand/Lumi';

const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

const People: React.FC<{ people: UserSummary[] }> = ({ people }) => (
  <span className="flex">
    {people.slice(0, 4).map((person) => (
      <span key={person.id} className="-mr-1.5 rounded-full ring-[3px] ring-[var(--eq-raised)]">
        <UserAvatar username={person.username} avatarUrl={person.avatarUrl} size={26} />
      </span>
    ))}
    {people.length > 4 && <span className="ml-3 self-center text-xs font-semibold text-slate-500">+{people.length - 4}</span>}
  </span>
);

const StudyCountdown: React.FC<{ state: LiveGroupState }> = ({ state }) => {
  const room = state.studyRoom!;
  const [now, setNow] = useState(Date.now());
  const [offset] = useState(() => clockOffset(room));
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const phase = phaseOf(room, offset, now);
  if (!phase) return null;
  return (
    <span className="text-sm text-slate-500">
      {phase.phase === 'FOCUS' ? 'Enfoque' : 'Descanso'} · quedan {formatCountdown(phase.secondsLeft)}
    </span>
  );
};

interface LiveNowProps {
  studyRooms: LiveGroupState[];
  voiceRooms: LiveGroupState[];
  sessions: StudySessionResponse[];
  loading: boolean;
}

const cardClass = 'flex flex-col gap-2.5 rounded-2xl bg-raised p-4 transition hover:-translate-y-0.5';

export const LiveNow: React.FC<LiveNowProps> = ({ studyRooms, voiceRooms, sessions, loading }) => {
  const empty = !loading && studyRooms.length + voiceRooms.length + sessions.length === 0;

  return (
    <section aria-labelledby="en-vivo">
      <h2 id="en-vivo" className="mb-3 text-xl font-bold text-slate-900">
        En vivo ahora
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Cargando actividad">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-raised" />
          ))}
        </div>
      ) : empty ? (
        <div className="flex items-center gap-4 rounded-2xl bg-raised p-5">
          <Lumi mood="sleepy" size={72} animated={false} />
          <p className="text-[15px] text-slate-600">
            Tus grupos están tranquilos. Inicia una sala de estudio en un grupo y tus compañeros te verán aquí.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {studyRooms.map((state) => (
            <li key={`study-${state.group.id}`}>
              <Link to={`/groups/${state.group.id}`} className={`${cardClass} eq-live`}>
                <span className="flex items-center gap-2 text-xs font-extrabold text-lumi-ink">
                  <span className="eq-pulse h-2.5 w-2.5 rounded-full bg-lumi" aria-hidden="true" />
                  <Timer size={14} /> Sala de estudio
                </span>
                <span className="truncate text-base font-bold text-slate-900">{state.group.name}</span>
                <StudyCountdown state={state} />
                <People people={state.studyRoom?.participants ?? []} />
              </Link>
            </li>
          ))}
          {voiceRooms.map((state) => (
            <li key={`voice-${state.group.id}`}>
              <Link to={`/groups/${state.group.id}`} className={cardClass}>
                <span className="flex items-center gap-2 text-xs font-extrabold text-mint-ink">
                  <span className="h-2.5 w-2.5 rounded-full bg-mint" aria-hidden="true" />
                  <Headphones size={14} /> En voz
                </span>
                <span className="truncate text-base font-bold text-slate-900">{state.group.name}</span>
                <span className="text-sm text-slate-500">
                  {state.voice.length === 1 ? '1 persona conversando' : `${state.voice.length} personas conversando`}
                </span>
                <People people={state.voice} />
              </Link>
            </li>
          ))}
          {sessions.map((session) => (
            <li key={`session-${session.id}`}>
              <Link to={session.groupId ? `/groups/${session.groupId}?tab=sessions` : '/calendar'} className={cardClass}>
                <span className="flex items-center gap-2 text-xs font-extrabold text-celeste-ink">
                  <CalendarClock size={14} /> {session.started ? 'Asesoría en curso' : 'Asesoría hoy'}
                </span>
                <span className="truncate text-base font-bold text-slate-900">{session.title}</span>
                <span className="text-sm text-slate-500">
                  {TIME.format(new Date(session.scheduledAt))}
                  {session.groupName ? ` · ${session.groupName}` : ''}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {session.attending ? 'Confirmaste tu asistencia' : `${session.attendeeCount} confirmados`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
