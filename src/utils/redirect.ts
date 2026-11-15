import { Location } from 'react-router-dom';

export interface RedirectState {
  from?: Pick<Location, 'pathname' | 'search'>;
}

export const redirectPathFrom = (state: unknown, fallback = '/dashboard') => {
  const from = (state as RedirectState | null)?.from;
  return from ? `${from.pathname}${from.search ?? ''}` : fallback;
};
