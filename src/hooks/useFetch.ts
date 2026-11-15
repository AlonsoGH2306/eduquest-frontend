import { useCallback, useEffect, useState } from 'react';
import { extractErrorMessage, getErrorStatus, isCanceledError } from '../utils/errors';

interface UseFetchOptions<T> {
  enabled?: boolean;
  initialData?: T;
}

export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, options: UseFetchOptions<T> = {}) {
  const { enabled = true, initialData } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    fetcher(controller.signal)
      .then(setData)
      .catch((err) => {
        if (isCanceledError(err)) return;
        setError(extractErrorMessage(err));
        setErrorStatus(getErrorStatus(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [fetcher, enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, setData, loading, error, errorStatus, reload };
}
