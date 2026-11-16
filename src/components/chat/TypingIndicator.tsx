import React from 'react';
import { typingLabel } from '../../hooks/useRealtime';

export const TypingIndicator: React.FC<{ names: string[] }> = ({ names }) => {
  const label = typingLabel(names);
  return (
    <p aria-live="polite" className="h-5 px-4 text-[11px] text-slate-400 italic">
      {label}
    </p>
  );
};
