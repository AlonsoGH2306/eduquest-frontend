import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { extractFieldErrors } from './errors';

export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const fieldErrors = extractFieldErrors(error);
  const entries = Object.entries(fieldErrors);
  entries.forEach(([field, message]) => setError(field as Path<T>, { type: 'server', message }));
  return entries.length > 0;
}

export const inputClass = (hasError: boolean) =>
  `mt-1 w-full rounded-xl border px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-indigo-500'
  }`;
