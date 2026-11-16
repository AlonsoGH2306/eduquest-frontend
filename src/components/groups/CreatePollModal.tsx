import React, { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BarChart3, Plus, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (question: string, options: string[]) => Promise<unknown>;
}

interface FormValues {
  question: string;
  options: { text: string }[];
}

const EMPTY: FormValues = { question: '', options: [{ text: '' }, { text: '' }] };

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, onCreate }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange', defaultValues: EMPTY });
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });

  useEffect(() => {
    if (isOpen) reset(EMPTY);
  }, [isOpen, reset]);

  const onSubmit = async (values: FormValues) => {
    const options = values.options.map((option) => option.text.trim()).filter(Boolean);
    if (new Set(options.map((option) => option.toLowerCase())).size < MIN_OPTIONS) {
      setError('options', { message: 'Escribe al menos 2 opciones distintas' });
      return;
    }
    try {
      await onCreate(values.question.trim(), options);
      onClose();
    } catch (error) {
      if (!applyServerErrors(error, setError)) toast.error(extractErrorMessage(error));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva encuesta">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="poll-question" className="block text-xs font-semibold text-slate-700">
            Pregunta
          </label>
          <input
            id="poll-question"
            maxLength={200}
            placeholder="¿Qué día repasamos para el parcial?"
            className={inputClass(Boolean(errors.question))}
            {...register('question', {
              validate: (value) => value.trim().length >= 3 || 'La pregunta debe tener al menos 3 caracteres',
            })}
          />
          {errors.question && <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>}
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-slate-700">Opciones</legend>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                aria-label={`Opción ${index + 1}`}
                maxLength={100}
                placeholder={`Opción ${index + 1}`}
                className={inputClass(Boolean(errors.options?.[index]?.text))}
                {...register(`options.${index}.text` as const, {
                  validate: (value) => index >= MIN_OPTIONS || value.trim().length > 0 || 'Completa esta opción',
                })}
              />
              {fields.length > MIN_OPTIONS && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Quitar opción ${index + 1}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {errors.options?.message && <p className="text-xs text-red-600">{errors.options.message}</p>}
          {fields.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <Plus size={12} /> Agregar opción
            </button>
          )}
        </fieldset>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <BarChart3 size={14} /> {isSubmitting ? 'Publicando...' : 'Publicar encuesta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
