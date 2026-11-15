import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'No pudimos cargar la información', message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
      <WifiOff size={22} />
    </div>
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-indigo-700"
      >
        <RefreshCw size={15} /> Reintentar
      </button>
    )}
  </div>
);
