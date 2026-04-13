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
  const dbVersion = useDbVersion();

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, dbVersion]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => {
        if (!cancelled) { setData(result); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) { setError(err instanceof Error ? err : new Error(String(err))); setLoading(false); }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, dbVersion]);

  return { data, loading, error, reload: load };
}
