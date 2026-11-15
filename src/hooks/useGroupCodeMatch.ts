import { useCallback } from 'react';
import { groupService } from '../services/groupService';
import { useFetch } from './useFetch';

const CODE_PATTERN = /^[A-Z0-9]{6}$/;

export const normalizeGroupCode = (value: string) => value.replace(/[\s#-]/g, '').toUpperCase();

export function useGroupCodeMatch(term: string) {
  const code = normalizeGroupCode(term);
  const looksLikeCode = CODE_PATTERN.test(code) && !/\s/.test(term.trim());

  const fetchByCode = useCallback(
    (signal: AbortSignal) => groupService.getGroupByCode(code, signal).catch(() => null),
    [code]
  );
  const { data, loading } = useFetch(fetchByCode, { enabled: looksLikeCode });

  return { match: looksLikeCode ? (data ?? null) : null, searching: looksLikeCode && loading };
}
