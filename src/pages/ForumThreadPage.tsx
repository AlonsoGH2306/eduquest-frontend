import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronDown, ChevronUp, Send, Trash2 } from 'lucide-react';
import { forumService } from '../services/forumService';
import { useFetch } from '../hooks/useFetch';
import { ForumAnswer } from '../types';
import { extractErrorMessage } from '../utils/errors';
import { timeAgo } from '../utils/relativeTime';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ErrorState } from '../components/common/ErrorState';
import { Spinner } from '../components/common/Spinner';
import { UserAvatar } from '../components/common/UserAvatar';
import { AdvisorBadge } from '../components/common/AdvisorBadge';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ForumThreadPage: React.FC = () => {
  const { questionId } = useParams();
  const id = Number(questionId);
  const navigate = useNavigate();
  const { data, setData, loading, error, reload } = useFetch(
    useCallback((signal: AbortSignal) => forumService.getThread(id, signal), [id])
  );
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState<{ kind: 'question' } | { kind: 'answer'; answer: ForumAnswer } | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading && !data) return <Spinner label="Cargando pregunta..." />;
  if (error || !data) return <ErrorState message={error ?? 'Pregunta no encontrada'} onRetry={reload} />;

  const { question, answers, canAccept } = data;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if (body.length < 2) return;
    setSending(true);
    try {
      const answer = await forumService.answer(id, body);
      setData({
        ...data,
        answers: [...data.answers, answer],
        question: { ...question, answerCount: question.answerCount + 1 },
      });
      setReply('');
      toast.success('Respuesta publicada');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const vote = async (answer: ForumAnswer, value: number) => {
    try {
      const updated = await forumService.vote(answer.id, answer.myVote === value ? 0 : value);
      setData({ ...data, answers: data.answers.map((item) => (item.id === updated.id ? updated : item)) });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const accept = async (answer: ForumAnswer) => {
    try {
      setData(await forumService.accept(id, answer.id));
      toast.success(answer.accepted ? 'Quitaste la mejor respuesta' : 'Marcaste la mejor respuesta');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (toDelete.kind === 'question') {
        await forumService.deleteQuestion(id);
        toast.success('Pregunta eliminada');
        navigate('/forum');
        return;
      }
      await forumService.deleteAnswer(toDelete.answer.id);
      setData({
        ...data,
        answers: data.answers.filter((item) => item.id !== toDelete.answer.id),
        question: {
          ...question,
          answerCount: Math.max(0, question.answerCount - 1),
          solved: question.solved && !toDelete.answer.accepted,
        },
      });
      toast.success('Respuesta eliminada');
      setToDelete(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ label: 'Foro', to: '/forum' }, { label: question.title }]} />

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{question.title}</h1>
          {question.canDelete && (
            <button
              type="button"
              onClick={() => setToDelete({ kind: 'question' })}
              aria-label="Eliminar pregunta"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {question.course && (
            <span className="rounded-full bg-violet-50 px-2 py-0.5 font-medium text-violet-700">{question.course}</span>
          )}
          <Link to={`/users/${question.author.id}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600">
            <UserAvatar username={question.author.username} avatarUrl={question.author.avatarUrl} size={20} />
            <span>@{question.author.username}</span>
          </Link>
          <span>{timeAgo(question.createdAt)}</span>
          {question.solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
              <CheckCircle2 size={12} /> Resuelta
            </span>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{question.body}</p>
      </article>

      <h2 className="mt-8 mb-3 text-base font-bold text-slate-900">
        {answers.length === 0 ? 'Aún no hay respuestas' : `${answers.length} ${answers.length === 1 ? 'respuesta' : 'respuestas'}`}
      </h2>

      <ul className="space-y-3">
        {answers.map((answer) => (
          <li
            key={answer.id}
            className={`flex gap-4 rounded-2xl border bg-white p-5 shadow-xs ${
              answer.accepted ? 'border-emerald-300' : 'border-slate-200'
            }`}
          >
            <div className="flex shrink-0 flex-col items-center">
              <button
                type="button"
                disabled={answer.mine}
                onClick={() => vote(answer, 1)}
                aria-label="Útil"
                aria-pressed={answer.myVote === 1}
                className={`rounded-lg p-1 transition disabled:opacity-30 ${
                  answer.myVote === 1 ? 'text-indigo-600' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <ChevronUp size={20} />
              </button>
              <span className="text-sm font-bold text-slate-800">{answer.score}</span>
              <button
                type="button"
                disabled={answer.mine}
                onClick={() => vote(answer, -1)}
                aria-label="No útil"
                aria-pressed={answer.myVote === -1}
                className={`rounded-lg p-1 transition disabled:opacity-30 ${
                  answer.myVote === -1 ? 'text-red-600' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              {answer.accepted && (
                <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 size={12} /> Mejor respuesta
                </p>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{answer.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <Link to={`/users/${answer.author.id}`} className="inline-flex items-center gap-1.5 hover:text-indigo-600">
                  <UserAvatar username={answer.author.username} avatarUrl={answer.author.avatarUrl} size={18} />
                  <span>@{answer.author.username}</span>
                </Link>
                {answer.author.advisor && <AdvisorBadge compact />}
                <span>{timeAgo(answer.createdAt)}</span>
                <span className="ml-auto flex items-center gap-1">
                  {canAccept && (
                    <button
                      type="button"
                      onClick={() => accept(answer)}
                      className={`rounded-lg px-2 py-1 font-semibold transition ${
                        answer.accepted ? 'text-emerald-700 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {answer.accepted ? 'Quitar como mejor' : 'Marcar como mejor'}
                    </button>
                  )}
                  {answer.canDelete && (
                    <button
                      type="button"
                      onClick={() => setToDelete({ kind: 'answer', answer })}
                      aria-label="Eliminar respuesta"
                      className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={send} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <label htmlFor="forum-reply" className="text-sm font-semibold text-slate-800">
          Tu respuesta
        </label>
        <textarea
          id="forum-reply"
          rows={4}
          maxLength={5000}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Explica paso a paso; si puedes, agrega un ejemplo."
          className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={sending || reply.trim().length < 2}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={15} /> {sending ? 'Publicando...' : 'Responder'}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={toDelete?.kind === 'question' ? 'Eliminar pregunta' : 'Eliminar respuesta'}
        message={
          toDelete?.kind === 'question'
            ? 'Se borrarán la pregunta y todas sus respuestas. No se puede deshacer.'
            : 'La respuesta se borrará para todos. No se puede deshacer.'
        }
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        destructive
        loading={deleting}
        icon={<Trash2 size={14} />}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};
