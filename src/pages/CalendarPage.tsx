import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, Clock, Download, Users, Video } from 'lucide-react';
import { extractErrorMessage } from '../utils/errors';
import { groupService } from '../services/groupService';
import { useFetch } from '../hooks/useFetch';
import { StudySessionResponse } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ErrorState } from '../components/common/ErrorState';
import { Spinner } from '../components/common/Spinner';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
const DAY_TITLE = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });

const pad = (value: number) => String(value).padStart(2, '0');
const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const buildGrid = (month: Date) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
};

const sessionTone = (session: StudySessionResponse) => {
  if (session.finished) return 'bg-slate-100 text-slate-500';
  if (session.started) return 'bg-emerald-50 text-emerald-700';
  if (session.attending) return 'bg-indigo-600 text-white';
  return 'bg-indigo-50 text-indigo-700';
};

export const CalendarPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [exporting, setExporting] = useState(false);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);
  const days = useMemo(() => buildGrid(month), [month]);
  const from = isoDate(days[0]);
  const to = isoDate(new Date(days[41].getFullYear(), days[41].getMonth(), days[41].getDate() + 1));

  const { data, loading, error, reload } = useFetch(
    useCallback((signal: AbortSignal) => groupService.getMySessions(from, to, signal), [from, to])
  );

  const byDay = useMemo(() => {
    const map = new Map<string, StudySessionResponse[]>();
    for (const session of data ?? []) {
      const key = isoDate(new Date(session.scheduledAt));
      map.set(key, [...(map.get(key) ?? []), session]);
    }
    return map;
  }, [data]);

  const selectedSessions = byDay.get(isoDate(selected)) ?? [];
  const upcoming = (data ?? []).filter((session) => !session.finished && session.attending).slice(0, 5);

  const changeMonth = (delta: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  const goToday = () => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(today);
  };

  const exportCalendar = async () => {
    setExporting(true);
    try {
      const blob = await groupService.downloadCalendar();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eduquest-asesorias.ics';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Archivo descargado. En Google Calendar ve a Configuración → Importar y elige el archivo.', {
        duration: 7000,
      });
      window.open('https://calendar.google.com/calendar/r/settings/export', '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Mi calendario' }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi calendario</h1>
          <p className="mt-1 text-sm text-slate-500">Las asesorías de todos tus grupos en un solo lugar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void exportCalendar()}
            disabled={exporting}
            title="Descarga un .ics para importarlo en Google Calendar u Outlook"
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            <Download size={16} /> {exporting ? 'Preparando...' : 'Exportar a Google Calendar'}
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Mes anterior"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-40 text-center text-sm font-bold text-slate-900 capitalize">{MONTH.format(month)}</span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Mes siguiente"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <Spinner label="Cargando sesiones..." />
              </div>
            )}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const sessions = byDay.get(isoDate(day)) ?? [];
                const inMonth = day.getMonth() === month.getMonth();
                const isToday = sameDay(day, today);
                const isSelected = sameDay(day, selected);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelected(day)}
                    aria-label={`${DAY_TITLE.format(day)}, ${sessions.length} sesiones`}
                    aria-pressed={isSelected}
                    className={`flex min-h-24 flex-col gap-1 border-r border-b border-slate-100 p-1.5 text-left transition hover:bg-slate-50 ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-inset' : ''
                    } ${inMonth ? '' : 'opacity-40'}`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {sessions.slice(0, 2).map((session) => (
                      <span key={session.id} className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${sessionTone(session)}`}>
                        {TIME.format(new Date(session.scheduledAt))} {session.title}
                      </span>
                    ))}
                    {sessions.length > 2 && <span className="px-1 text-[10px] font-semibold text-slate-500">+{sessions.length - 2} más</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-900 capitalize">{DAY_TITLE.format(selected)}</h2>
              {selectedSessions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No hay asesorías este día.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {selectedSessions.map((session) => (
                    <li key={session.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={12} /> {TIME.format(new Date(session.scheduledAt))} – {TIME.format(new Date(session.endsAt))}
                      </p>
                      {session.groupName && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={12} /> {session.groupName}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {session.attending && !session.finished && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                            <CalendarCheck size={11} /> Confirmaste
                          </span>
                        )}
                        {session.started && !session.finished && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <Video size={11} /> En curso
                          </span>
                        )}
                        {session.groupId && (
                          <Link
                            to={`/groups/${session.groupId}?tab=sessions`}
                            className="ml-auto text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Ver en el grupo
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <CalendarDays size={16} className="text-indigo-600" /> Próximas que confirmaste
              </h2>
              {upcoming.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No tienes asesorías confirmadas en estas fechas.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {upcoming.map((session) => (
                    <li key={session.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date(session.scheduledAt);
                          setSelected(date);
                          setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                        }}
                        className="w-full rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
                      >
                        <p className="truncate text-sm font-medium text-slate-800">{session.title}</p>
                        <p className="text-xs text-slate-500">
                          {DAY_TITLE.format(new Date(session.scheduledAt))} · {TIME.format(new Date(session.scheduledAt))}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
};
