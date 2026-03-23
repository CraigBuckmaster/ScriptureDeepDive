import { useState, useEffect } from 'react';
import { getRecentChapters } from '../db/user';
import type { RecentChapter } from '../types';

export function useRecentChapters(limit: number = 10) {
  const [recent, setRecent] = useState<RecentChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentChapters(limit).then((r) => { setRecent(r); setIsLoading(false); });
  }, [limit]);

  /** Call after navigating to a chapter to refresh the list. */
  const refresh = () => {
    getRecentChapters(limit).then(setRecent);
  };

  return { recent, isLoading, refresh };
}
