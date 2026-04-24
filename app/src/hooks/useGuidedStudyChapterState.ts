import { useEffect, useMemo, useState } from 'react';
import {
  getActiveGuidedStudySession,
  getDueGuidedReviewItemCountForChapter,
} from '../db/userQueries';
import type { GuidedStudySession, GuidedStudyStep } from '../types';
import { logger } from '../utils/logger';

type GuidedStudyChapterCtaMode = 'start' | 'continue' | 'review';

export function useGuidedStudyChapterState(chapterId: string | undefined) {
  const [activeSession, setActiveSession] = useState<GuidedStudySession | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!chapterId) {
      setActiveSession(null);
      setDueCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void (async () => {
      try {
        const [session, due] = await Promise.all([
          getActiveGuidedStudySession(chapterId),
          getDueGuidedReviewItemCountForChapter(chapterId),
        ]);
        if (cancelled) return;
        setActiveSession(session);
        setDueCount(due);
      } catch (err) {
        logger.warn('useGuidedStudyChapterState', 'Failed to load chapter study state', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  return useMemo(() => {
    const mode: GuidedStudyChapterCtaMode = activeSession
      ? 'continue'
      : dueCount > 0
        ? 'review'
        : 'start';
    const initialStep: GuidedStudyStep | undefined =
      activeSession?.current_step ?? (dueCount > 0 ? 'review' : undefined);

    return {
      mode,
      initialStep,
      dueCount,
      activeSession,
      isLoading,
    };
  }, [activeSession, dueCount, isLoading]);
}
