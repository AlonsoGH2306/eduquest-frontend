import { Availability } from '../types';

export const AVAILABILITY_OPTIONS: { value: Availability; label: string; dot: string }[] = [
  { value: 'AVAILABLE', label: 'Disponible', dot: 'bg-mint' },
  { value: 'BUSY', label: 'Ocupado', dot: 'bg-red-500' },
  { value: 'AWAY', label: 'Ausente', dot: 'bg-amber-400' },
  { value: 'INVISIBLE', label: 'Invisible', dot: 'bg-slate-400' },
];

export const availabilityDot = (availability?: Availability | null, online = true) => {
  if (!online) return 'bg-slate-300';
  return AVAILABILITY_OPTIONS.find((option) => option.value === availability)?.dot ?? 'bg-mint';
};

export const availabilityLabel = (availability?: Availability | null) =>
  AVAILABILITY_OPTIONS.find((option) => option.value === availability)?.label ?? 'Disponible';

export const STATUS_EMOJIS = ['📚', '💻', '🧠', '☕', '🎧', '🏃', '😴', '🎉'];
