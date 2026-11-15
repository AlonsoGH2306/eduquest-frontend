const RELATIVE = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

export const timeAgo = (value?: string | null): string => {
  if (!value) return 'Sin actividad reciente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const minutes = Math.round((date.getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return RELATIVE.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return RELATIVE.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return RELATIVE.format(days, 'day');
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};
