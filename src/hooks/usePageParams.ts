import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const PAGE_SIZES = [10, 25, 50, 100];

export function usePageParams(defaultSize = 10) {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = Number(searchParams.get('page') ?? 0);
  const rawSize = Number(searchParams.get('size') ?? defaultSize);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const size = PAGE_SIZES.includes(rawSize) ? rawSize : defaultSize;

  const updateParams = useCallback(
    (changes: Record<string, string | null>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          });
          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback((value: number) => updateParams({ page: String(value) }), [updateParams]);
  const setSize = useCallback((value: number) => updateParams({ size: String(value), page: '0' }), [updateParams]);

  return { page, size, setPage, setSize, searchParams, updateParams };
}
