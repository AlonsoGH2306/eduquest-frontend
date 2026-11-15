import React from 'react';

interface UnreadBadgeProps {
  count: number;
  label?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, label }) => {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label ?? `${count} novedades sin ver`}
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] leading-none font-bold text-white"
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
