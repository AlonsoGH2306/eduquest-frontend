import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { extractFieldErrors } from './errors';

export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const fieldErrors = extractFieldErrors(error);
  const entries = Object.entries(fieldErrors);
  entries.forEach(([field, message]) => setError(field as Path<T>, { type: 'server', message }));
  return entries.length > 0;
}

export const inputClass = (hasError: boolean) =>
  `mt-1.5 w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-[15px] text-slate-800 transition focus:ring-2 focus:outline-hidden ${
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/25' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/25'
  }`;
