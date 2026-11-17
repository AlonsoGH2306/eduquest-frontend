import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Lumi } from '../brand/Lumi';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'No pudimos cargar la información', message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 py-10 text-center">
    <Lumi mood="off" size={96} animated={false} className="mb-2" />
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <RefreshCw size={15} /> Reintentar
      </button>
    )}
  </div>
);
