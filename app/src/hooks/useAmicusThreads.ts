/**
 * hooks/useAmicusThreads.ts — Data hook for the Amicus thread list.
 *
 * Thin wrapper around listAmicusThreads + the thread mutations. Uses
 * local React state (no global cache needed — thread list is screen-local).
 */
import { useCallback, useEffect, useState } from 'react';
import {
  deleteAmicusThread,
  toggleThreadPin,
  updateThreadTitle,
} from '../db/userMutations';
import { listAmicusThreads } from '../db/userQueries';
import type { AmicusThread } from '../types';
import { logger } from '../utils/logger';

export interface UseAmicusThreadsResult {
  threads: AmicusThread[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  actions: {
    pin: (threadId: string) => Promise<void>;
    unpin: (threadId: string) => Promise<void>;
    remove: (threadId: string) => Promise<void>;
    rename: (threadId: string, title: string) => Promise<void>;
  };
}

export function useAmicusThreads(limit = 50): UseAmicusThreadsResult {
  const [threads, setThreads] = useState<AmicusThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const rows = await listAmicusThreads(limit, 0);
      setThreads(rows);
    } catch (err) {
      logger.error('Amicus', 'listAmicusThreads failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pin = useCallback(
    async (threadId: string) => {
      const current = threads.find((t) => t.thread_id === threadId);
      if (!current || current.pinned) {
        await refresh();
        return;
      }
      // Optimistic update
      setThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, pinned: true } : t)),
      );
      try {
        await toggleThreadPin(threadId);
      } catch (err) {
        logger.error('Amicus', 'pin failed', err);
        await refresh();
      }
    },
    [threads, refresh],
  );

  const unpin = useCallback(
    async (threadId: string) => {
      const current = threads.find((t) => t.thread_id === threadId);
      if (!current || !current.pinned) {
        await refresh();
        return;
      }
      setThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, pinned: false } : t)),
      );
      try {
        await toggleThreadPin(threadId);
      } catch (err) {
        logger.error('Amicus', 'unpin failed', err);
        await refresh();
      }
    },
    [threads, refresh],
  );

  const remove = useCallback(
    async (threadId: string) => {
      setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
      try {
        await deleteAmicusThread(threadId);
      } catch (err) {
        logger.error('Amicus', 'remove failed', err);
        await refresh();
      }
    },
    [refresh],
  );

  const rename = useCallback(
    async (threadId: string, title: string) => {
      setThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, title } : t)),
      );
      try {
        await updateThreadTitle(threadId, title);
      } catch (err) {
        logger.error('Amicus', 'rename failed', err);
        await refresh();
      }
    },
    [refresh],
  );

  return {
    threads,
    isLoading,
    refresh,
    actions: { pin, unpin, remove, rename },
  };
}
