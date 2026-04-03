/**
 * useStudyRecorder — Records study session events for premium users.
 *
 * Starts a session when chapterId is provided, ends on cleanup.
 * Provides recordEvent() for ChapterScreen to call at key interaction points.
 * Uses refs throughout to avoid causing re-renders — recording is invisible to the UI.
 */

import { useEffect, useCallback, useRef } from 'react';
import { startStudySession, endStudySession, recordSessionEvent } from '../db/userMutations';
import { logger } from '../utils/logger';

export type StudyEventType =
  | 'panel_open'
  | 'panel_close'
  | 'scholar_view'
  | 'section_scroll'
  | 'verse_tap';

export interface StudyEventDetails {
  panel_type?: string;
  scholar_id?: string;
  section_id?: string;
  metadata_json?: string;
}

/**
 * Hook that records study session data for replay.
 * Only records when isPremium is true.
 *
 * @param chapterId - The current chapter being studied
 * @param isPremium - Whether the user has premium access
 * @returns recordEvent callback to log interactions
 */
export function useStudyRecorder(
  chapterId: string | undefined,
  isPremium: boolean,
) {
  const sessionIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isPremiumRef = useRef(isPremium);
  const chapterIdRef = useRef(chapterId);

  // Keep refs in sync without triggering effects
  isPremiumRef.current = isPremium;
  chapterIdRef.current = chapterId;

  // Start/end session lifecycle
  useEffect(() => {
    if (!chapterId || !isPremium) return;

    let cancelled = false;
    sessionIdRef.current = null;
    startTimeRef.current = Date.now();

    (async () => {
      try {
        const id = await startStudySession(chapterId);
        if (cancelled) {
          // Component unmounted before insert completed — end immediately
          const duration = Date.now() - startTimeRef.current;
          await endStudySession(id, duration);
          return;
        }
        sessionIdRef.current = id;
      } catch (err) {
        logger.error('useStudyRecorder', 'Failed to start session', err);
      }
    })();

    return () => {
      cancelled = true;
      const sid = sessionIdRef.current;
      const duration = Date.now() - startTimeRef.current;
      sessionIdRef.current = null;

      if (sid != null) {
        endStudySession(sid, duration).catch((err) =>
          logger.error('useStudyRecorder', 'Failed to end session', err)
        );
      }
    };
  }, [chapterId, isPremium]);

  const recordEvent = useCallback(
    (type: StudyEventType, details?: StudyEventDetails) => {
      const sid = sessionIdRef.current;
      if (sid == null || !isPremiumRef.current) return;

      recordSessionEvent(sid, {
        event_type: type,
        panel_type: details?.panel_type,
        scholar_id: details?.scholar_id,
        section_id: details?.section_id,
        timestamp_ms: Date.now() - startTimeRef.current,
        metadata_json: details?.metadata_json,
      }).catch((err) =>
        logger.error('useStudyRecorder', 'Failed to record event', err)
      );
    },
    []
  );

  return { recordEvent };
}
