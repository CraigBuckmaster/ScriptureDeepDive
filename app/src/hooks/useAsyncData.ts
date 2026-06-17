import { useState, useEffect, useCallback, useRef, DependencyList } from 'react';
import { useDbVersion } from '../contexts/ContentUpdateContext';

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: DependencyList,
  initial: T,
): { data: T; loading: boolean; error: Error | null; reload: () => void } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  // Monotonic token shared by the auto-load effect and manual reload() so that
  // only the most recent invocation may commit results. This prevents a
  // reload() racing a deps change from letting a stale fetch win.
  const generationRef = useRef(0);
  const dbVersion = useDbVersion();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(() => {
    const generation = ++generationRef.current;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        if (mountedRef.current && generation === generationRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current && generation === generationRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, dbVersion]);

  // Single auto-load path: runs on mount and whenever deps/dbVersion change
  // (load identity is keyed on them). reload() reuses the same implementation.
  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
