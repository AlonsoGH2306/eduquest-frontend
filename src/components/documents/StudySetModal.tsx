import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, ChevronLeft, ChevronRight, Layers, ListChecks, RefreshCw, RotateCcw, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Spinner } from '../common/Spinner';
import { studySetService } from '../../services/studySetService';
import { DocumentResponse, StudySet, StudySetType } from '../../types';
import { extractErrorMessage } from '../../utils/errors';

interface StudySetModalProps {
  document: DocumentResponse | null;
  onClose: () => void;
}

const Quiz: React.FC<{ set: StudySet }> = ({ set }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = set.questions.filter((question, index) => answers[index] === question.answerIndex).length;

  return (
    <div className="space-y-4">
      {set.questions.map((question, index) => {
        const chosen = answers[index];
        const done = chosen !== undefined;
        return (
          <fieldset key={index} className="rounded-xl border border-slate-200 p-3">
            <legend className="px-1 text-sm font-semibold text-slate-900">
              {index + 1}. {question.question}
            </legend>
            <div className="mt-1 space-y-1.5">
              {question.options.map((option, optionIndex) => {
                const isAnswer = optionIndex === question.answerIndex;
                const state = !done
                  ? 'border-slate-200 hover:border-indigo-300'
                  : isAnswer
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : optionIndex === chosen
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-slate-200 opacity-60';
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={done}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm ${state}`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>
                    <span className="flex-1">{option}</span>
                    {done && isAnswer && <Check size={14} />}
                    {done && !isAnswer && optionIndex === chosen && <X size={14} />}
                  </button>
                );
              })}
            </div>
            {done && question.explanation && <p className="mt-2 text-xs text-slate-600">{question.explanation}</p>}
          </fieldset>
        );
      })}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
        <span>
          {answered < set.questions.length
            ? `Respondiste ${answered} de ${set.questions.length}`
            : `Resultado: ${correct} de ${set.questions.length} correctas`}
        </span>
        {answered > 0 && (
          <button type="button" onClick={() => setAnswers({})} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <RotateCcw size={12} /> Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

const Flashcards: React.FC<{ set: StudySet }> = ({ set }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = set.cards[index];

  const move = (step: number) => {
    setFlipped(false);
    setIndex((current) => (current + step + set.cards.length) % set.cards.length);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? 'Ver la pregunta' : 'Ver la respuesta'}
        className={`flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 p-6 text-center transition ${
          flipped ? 'border-emerald-300 bg-emerald-50' : 'border-indigo-200 bg-indigo-50'
        }`}
      >
        <span className="mb-2 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
          {flipped ? 'Respuesta' : 'Pregunta'} · toca para girar
        </span>
        <span className="text-lg font-semibold text-slate-900">{flipped ? card.back : card.front}</span>
      </button>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Anterior">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs text-slate-500">
          {index + 1} / {set.cards.length}
        </span>
        <button type="button" onClick={() => move(1)} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50" aria-label="Siguiente">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const StudySetModal: React.FC<StudySetModalProps> = ({ document, onClose }) => {
  const [type, setType] = useState<StudySetType>('QUIZ');
  const [set, setSet] = useState<StudySet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (refresh: boolean) => {
      if (!document) return;
      setLoading(true);
      setError(null);
      try {
        setSet(await studySetService.getStudySet(document.id, type, refresh));
      } catch (err) {
        setError(extractErrorMessage(err));
        if (refresh) toast.error(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [document, type]
  );

  useEffect(() => {
    setSet(null);
    if (document) void load(false);
  }, [document, type, load]);

  const tabClass = (active: boolean) =>
    `inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <Modal isOpen={document !== null} onClose={onClose} title={`Estudiar: ${document?.title ?? ''}`} size="xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 gap-1 rounded-xl bg-slate-50 p-1">
          <button type="button" className={tabClass(type === 'QUIZ')} onClick={() => setType('QUIZ')}>
            <ListChecks size={14} /> Quiz
          </button>
          <button type="button" className={tabClass(type === 'FLASHCARDS')} onClick={() => setType('FLASHCARDS')}>
            <Layers size={14} /> Flashcards
          </button>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(true)}
          title="Generar otro"
          aria-label="Generar otro"
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {loading && !set ? (
        <Spinner label="La IA está leyendo el material (puede tardar unos segundos)..." />
      ) : error && !set ? (
        <div className="space-y-2 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button type="button" onClick={() => void load(false)} className="text-xs font-semibold text-indigo-600 hover:underline">
            Reintentar
          </button>
        </div>
      ) : set ? (
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {set.type === 'QUIZ' ? <Quiz key={set.createdAt} set={set} /> : <Flashcards key={set.createdAt} set={set} />}
          <p className="mt-3 text-[11px] text-slate-400">Generado con IA: revisa las respuestas con tu material.</p>
        </div>
      ) : null}
    </Modal>
  );
};
