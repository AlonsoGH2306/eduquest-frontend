import React from 'react';

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    {icon} {label}
  </button>
);
