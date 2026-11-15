import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type Accent = 'indigo' | 'emerald' | 'violet';

const ACCENTS: Record<Accent, { icon: string; link: string }> = {
  indigo: { icon: 'bg-indigo-50 text-indigo-600', link: 'text-indigo-600' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', link: 'text-emerald-600' },
  violet: { icon: 'bg-violet-50 text-violet-600', link: 'text-violet-600' },
};

interface StatCardProps {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  to: string;
  linkLabel: string;
  accent: Accent;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, to, linkLabel, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <div className={`rounded-xl p-2.5 ${ACCENTS[accent].icon}`}>{icon}</div>
    </div>
    {value === null ? (
      <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-200" aria-label="Cargando" />
    ) : (
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    )}
    <Link to={to} className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold hover:underline ${ACCENTS[accent].link}`}>
      {linkLabel} <ArrowRight size={13} />
    </Link>
  </div>
);
