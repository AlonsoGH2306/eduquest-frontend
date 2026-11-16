import React from 'react';
import { Lumi } from '../brand/Lumi';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 py-10 text-center">
      <Lumi mood="sleepy" size={96} animated={false} className="mb-2" />
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};