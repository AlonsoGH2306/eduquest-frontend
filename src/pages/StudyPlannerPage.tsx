import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Sparkles, BookOpen, Clock, Plus, X } from 'lucide-react';
import { useStudyPlans } from '../hooks/useStudyPlans';
import { PlanContent } from '../components/plans/PlanContent';
import { PlanProgress } from '../components/plans/PlanProgress';
import { ErrorState } from '../components/common/ErrorState';
import { formatDateTime } from '../utils/formatDate';
import { extractErrorMessage } from '../utils/errors';
import { CourseInput, StudyPlanResponse } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';

const MAX_COURSES = 8;
const emptyCourse: CourseInput = { name: '', difficulty: 'Media' };

interface PlannerForm {
  courses: CourseInput[];
}

const difficultyLabel = (difficulty: string) => (difficulty === 'Mixta' ? 'Ciclo completo' : `Dificultad ${difficulty}`);

export const StudyPlannerPage: React.FC = () => {
  const { plans, loading: loadingHistory, error, reload, generating, generatePlan, toggleStep } = useStudyPlans();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedPlan: StudyPlanResponse | null = plans.find((plan) => plan.id === selectedId) ?? plans[0] ?? null;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlannerForm>({
    defaultValues: { courses: [emptyCourse] },
    mode: 'onChange',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'courses' });

  const onSubmit = async ({ courses }: PlannerForm) => {
    try {
      const created = await generatePlan({
        courses: courses.map((course) => ({ name: course.name.trim(), difficulty: course.difficulty })),
      });
      setSelectedId(created.id);
      reset({ courses: [emptyCourse] });
      toast.success('¡Plan de estudio generado!');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const onToggleStep = async (index: number) => {
    if (!selectedPlan) return;
    try {
      await toggleStep(selectedPlan, index);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planificador de Estudio' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Planificador de Estudio</h1>
        <p className="text-sm text-slate-500">
          Ingresa uno o todos los cursos de tu ciclo con su dificultad y obtén una hoja de ruta semanal
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:sticky lg:top-24 lg:col-span-1 lg:max-h-[calc(100vh-8rem)] lg:self-start">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
            <Sparkles size={18} className="text-indigo-600" /> Nuevo Plan de Estudio
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`course-${index}`} className="text-xs font-semibold text-slate-700">
                      Curso {fields.length > 1 ? index + 1 : ''}
                    </label>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Quitar curso ${index + 1}`}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    id={`course-${index}`}
                    type="text"
                    placeholder="Ej. Algoritmos y Estructuras de Datos"
                    {...register(`courses.${index}.name`, {
                      required: 'El nombre del curso es obligatorio',
                      maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                      validate: (value) => value.trim().length > 0 || 'El nombre del curso es obligatorio',
                    })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                  />
                  {errors.courses?.[index]?.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.courses[index]?.name?.message}</p>
                  )}
                  <select
                    aria-label={`Dificultad del curso ${index + 1}`}
                    {...register(`courses.${index}.difficulty`, { required: true })}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Baja">Dificultad baja</option>
                    <option value="Media">Dificultad media</option>
                    <option value="Alta">Dificultad alta</option>
                  </select>
                </div>
              ))}
            </div>

            {fields.length < MAX_COURSES && (
              <button
                type="button"
                onClick={() => append(emptyCourse)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-700"
              >
                <Plus size={14} /> Agregar otro curso del ciclo
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles size={15} />
              {isSubmitting
                ? 'Generando plan...'
                : fields.length > 1
                  ? `Generar plan para ${fields.length} cursos`
                  : 'Generar Plan de Estudio'}
            </button>
          </form>

          <div className="mt-6 flex min-h-0 flex-1 flex-col border-t border-slate-100 pt-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Clock size={13} /> Mis Planes Guardados ({plans.length})
            </h3>
            {loadingHistory ? (
              <Spinner size={20} label="Cargando historial..." />
            ) : error ? (
              <p className="text-xs text-red-600">
                {error}{' '}
                <button type="button" onClick={reload} className="font-semibold underline">
                  Reintentar
                </button>
              </p>
            ) : plans.length === 0 ? (
              <p className="text-xs text-slate-400">Aún no has generado planes.</p>
            ) : (
              <div className="max-h-96 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    aria-pressed={selectedPlan?.id === p.id}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedPlan?.id === p.id
                        ? 'border-indigo-600 bg-indigo-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="line-clamp-1 text-xs font-bold text-slate-800">{p.courseName}</p>
                    <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {difficultyLabel(p.difficulty)}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">{formatDateTime(p.createdAt)}</span>
                    <PlanProgress completed={p.completedSteps.length} total={p.totalSteps} compact />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          {generating ? (
            <Spinner size={34} label="Generando tu plan de estudio..." />
          ) : selectedPlan ? (
            <div>
              <div className="mb-4 space-y-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    <BookOpen size={12} /> {difficultyLabel(selectedPlan.difficulty)}
                  </span>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{selectedPlan.courseName}</h2>
                </div>
                <PlanProgress completed={selectedPlan.completedSteps.length} total={selectedPlan.totalSteps} />
                {selectedPlan.totalSteps > 0 && (
                  <p className="text-xs text-slate-500">Marca cada actividad cuando la termines; tu avance se guarda solo.</p>
                )}
              </div>
              <div className="rounded-xl bg-slate-50 p-5">
                <PlanContent
                  content={selectedPlan.generatedContent}
                  completedSteps={selectedPlan.completedSteps}
                  onToggleStep={onToggleStep}
                />
              </div>
            </div>
          ) : loadingHistory ? (
            <Spinner size={30} label="Cargando tus planes..." />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : (
            <EmptyState
              title="Selecciona o genera un plan de estudio"
              description="Ingresa tus cursos a la izquierda para estructurar tu plan semanal."
            />
          )}
        </div>
      </div>
    </div>
  );
};
