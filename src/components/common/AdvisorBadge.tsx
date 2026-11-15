import React from 'react';
import { GraduationCap } from 'lucide-react';

export const AdvisorBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <span
    title="Asesor"
    className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
  >
    <GraduationCap size={11} />
    {!compact && 'Asesor'}
  </span>
);
