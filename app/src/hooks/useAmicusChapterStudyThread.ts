import { useEffect, useState } from 'react';
import { getLatestStudyAmicusThreadIdForChapter } from '@/db/userQueries';
import { logger } from '@/utils/logger';

export function useAmicusChapterStudyThread(chapterRef: string | null) {
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!chapterRef) {
        if (!cancelled) setThreadId(null);
        return;
      }
      try {
        const next = await getLatestStudyAmicusThreadIdForChapter(chapterRef);
        if (!cancelled) setThreadId(next);
      } catch (err) {
        logger.warn('useAmicusChapterStudyThread', 'failed to load existing study thread', err);
        if (!cancelled) setThreadId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chapterRef]);

  return threadId;
}
