/**
 * hooks/useDailyPrompt.ts — React hook wrapper for the daily "Amicus
 * noticed..." prompt service (#1465).
 *
 * Fires on mount and exposes a manual `refresh()` for pull-to-refresh.
 * Returns null when no cache is available and the proxy is unreachable — the
 * home card (#1466) hides itself in that case.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDailyPrompt,
  type DailyPrompt,
  type GetDailyPromptOptions,
} from '@/services/amicus/dailyPrompt';

export interface UseDailyPromptResult {
  prompt: DailyPrompt | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useDailyPrompt(
  opts: GetDailyPromptOptions = {},
): UseDailyPromptResult {
  const [prompt, setPrompt] = useState<DailyPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const result = await getDailyPrompt(opts);
    if (mountedRef.current) {
      setPrompt(result);
      setIsLoading(false);
    }
    // Options are expected to be stable across renders; exhaustive-deps can't
    // see into the caller but we don't want spurious reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { prompt, isLoading, refresh: load };
}
