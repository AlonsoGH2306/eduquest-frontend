import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { inputClass } from '../../utils/forms';

export interface AskValues {
  title: string;
  body: string;
  course: string;
}

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AskValues) => Promise<void>;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AskValues>({ mode: 'onChange', defaultValues: { title: '', body: '', course: '' } });

  useEffect(() => {
    if (isOpen) reset({ title: '', body: '', course: '' });
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hacer una pregunta">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="ask-title" className="text-sm font-semibold text-slate-700">
            Título
          </label>
          <input
            id="ask-title"
            maxLength={150}
            placeholder="Ej.: ¿Cuándo conviene usar integración por partes?"
            className={inputClass(Boolean(errors.title))}
            {...register('title', {
              required: 'Escribe un título',
              minLength: { value: 8, message: 'Usa al menos 8 caracteres' },
            })}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="ask-course" className="text-sm font-semibold text-slate-700">
            Curso <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input id="ask-course" maxLength={100} placeholder="Ej.: Cálculo I" className={inputClass(false)} {...register('course')} />
        </div>
        <div>
          <label htmlFor="ask-body" className="text-sm font-semibold text-slate-700">
            Detalle
          </label>
          <textarea
            id="ask-body"
            rows={6}
            maxLength={5000}
            placeholder="Explica qué intentaste y en qué parte te trabaste."
            className={inputClass(Boolean(errors.body))}
            {...register('body', {
              required: 'Describe tu duda',
              minLength: { value: 15, message: 'Usa al menos 15 caracteres' },
            })}
          />
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar pregunta'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
