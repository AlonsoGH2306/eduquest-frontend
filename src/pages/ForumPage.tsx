import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, GraduationCap, MessagesSquare, Plus, Search } from 'lucide-react';
import { forumService } from '../services/forumService';
import { usePaginatedFetch } from '../hooks/usePaginatedFetch';
import { usePageParams } from '../hooks/usePageParams';
import { useDebounce } from '../hooks/useDebounce';
import { ForumFilter } from '../types';
import { extractErrorMessage } from '../utils/errors';
import { timeAgo } from '../utils/relativeTime';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { PaginationBar } from '../components/common/PaginationBar';
import { Spinner } from '../components/common/Spinner';
import { UserAvatar } from '../components/common/UserAvatar';
import { AskQuestionModal, AskValues } from '../components/forum/AskQuestionModal';

const FILTERS: { value: ForumFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unanswered', label: 'Sin respuesta' },
  { value: 'solved', label: 'Resueltas' },
];

export const ForumPage: React.FC = () => {
  const navigate = useNavigate();
  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const filter = (FILTERS.find((option) => option.value === searchParams.get('filter'))?.value ?? 'all') as ForumFilter;
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [course, setCourse] = useState(searchParams.get('course') ?? '');
  const debouncedSearch = useDebounce(search, 400);
  const debouncedCourse = useDebounce(course, 400);
  const [asking, setAsking] = useState(false);

  const fetchPage = useCallback(
    (pageNumber: number, pageSize: number, signal: AbortSignal) =>
      forumService.getQuestions(
        {
          search: debouncedSearch.trim() || undefined,
          course: debouncedCourse.trim() || undefined,
          filter,
          page: pageNumber,
          size: pageSize,
        },
        signal
      ),
    [debouncedSearch, debouncedCourse, filter]
  );
  const { items, totalElements, totalPages, loading, error, reload } = usePaginatedFetch(fetchPage, page, size);

  const ask = async (values: AskValues) => {
    try {
      const question = await forumService.ask(values.title.trim(), values.body.trim(), values.course.trim());
      toast.success('Pregunta publicada');
      setAsking(false);
      navigate(`/forum/${question.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Foro' }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Foro de preguntas</h1>
          <p className="mt-1 text-sm text-slate-500">Pregunta tus dudas por curso y ayuda a otros estudiantes.</p>
        </div>
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus size={16} /> Hacer una pregunta
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative">
          <span className="sr-only">Buscar preguntas</span>
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (page !== 0) setPage(0);
            }}
            placeholder="Buscar en títulos y descripciones"
            className="w-full rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filtrar por curso</span>
          <GraduationCap size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            value={course}
            onChange={(event) => {
              setCourse(event.target.value);
              if (page !== 0) setPage(0);
            }}
            placeholder="Curso exacto"
            className="w-full rounded-xl border border-slate-300 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-hidden"
          />
        </label>
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateParams({ filter: option.value === 'all' ? null : option.value, page: '0' })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === option.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Cargando preguntas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay preguntas aquí"
          description="Sé el primero en preguntar: alguien de la comunidad te ayudará."
          actionLabel="Hacer una pregunta"
          onAction={() => setAsking(true)}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((question) => (
              <li key={question.id}>
                <Link
                  to={`/forum/${question.id}`}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div
                    className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
                      question.solved ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {question.solved ? <CheckCircle2 size={18} /> : <MessagesSquare size={18} />}
                    <span className="mt-1 text-sm font-bold">{question.answerCount}</span>
                    <span className="text-[10px]">{question.answerCount === 1 ? 'respuesta' : 'respuestas'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1 text-base font-bold text-slate-900">{question.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{question.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {question.course && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">{question.course}</span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <UserAvatar username={question.author.username} avatarUrl={question.author.avatarUrl} size={18} />
                        <span>@{question.author.username}</span>
                      </span>
                      <span>{timeAgo(question.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <PaginationBar
              page={page}
              size={size}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </div>
        </>
      )}

      <AskQuestionModal isOpen={asking} onClose={() => setAsking(false)} onSubmit={ask} />
    </div>
  );
};
