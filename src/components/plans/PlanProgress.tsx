import React from 'react';

interface PlanProgressProps {
  completed: number;
  total: number;
  compact?: boolean;
}

export const PlanProgress: React.FC<PlanProgressProps> = ({ completed, total, compact = false }) => {
  if (total === 0) return null;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className={compact ? 'mt-2' : ''}>
      {!compact && (
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
          <span>
            {completed} de {total} pasos completados
          </span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        className={`overflow-hidden rounded-full bg-slate-200 ${compact ? 'h-1.5' : 'h-2'}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Progreso del plan"
      >
        <div
          className={`h-full rounded-full transition-all ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
