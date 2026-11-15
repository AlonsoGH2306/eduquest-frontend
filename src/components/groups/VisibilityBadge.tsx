import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { GroupVisibility } from '../../types';

export const VisibilityBadge: React.FC<{ visibility: GroupVisibility }> = ({ visibility }) =>
  visibility === 'PRIVATE' ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
      <Lock size={11} /> Privado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      <Globe size={11} /> Público
    </span>
  );
