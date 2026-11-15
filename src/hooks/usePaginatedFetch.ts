import { useCallback } from 'react';
import { PageResponse } from '../types';
import { useFetch } from './useFetch';

type PageFetcher<T> = (page: number, size: number, signal: AbortSignal) => Promise<PageResponse<T>>;

export function usePaginatedFetch<T>(fetchPage: PageFetcher<T>, page: number, size: number, enabled = true) {
  const fetcher = useCallback((signal: AbortSignal) => fetchPage(page, size, signal), [fetchPage, page, size]);
  const { data, setData, loading, error, errorStatus, reload } = useFetch(fetcher, { enabled });

  const setItems = useCallback(
    (update: (items: T[]) => T[]) =>
      setData((previous) => (previous ? { ...previous, content: update(previous.content) } : previous)),
    [setData]
  );

  return {
    items: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    loading,
    error,
    errorStatus,
    reload,
    setItems,
  };
}
