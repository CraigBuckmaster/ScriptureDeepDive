/**
 * useChapterCoaching — Parses coaching data and manages dismissed-tip state.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CoachingTip } from '../../types';

export function useChapterCoaching(
  coachingJson: string | null | undefined,
  bookId: string,
  chapterNum: number,
) {
  const [dismissedTips, setDismissedTips] = useState<Set<number>>(new Set());

  // Parse coaching data — supports both old array format and new CoachingData format
  const { coachingTips, chapterCoaching } = useMemo(() => {
    if (!coachingJson) return { coachingTips: [] as CoachingTip[], chapterCoaching: null };
    try {
      const parsed = JSON.parse(coachingJson);
      // New format: { section_tips, chapter_coaching, genre_tag }
      if (parsed && !Array.isArray(parsed) && (parsed.section_tips || parsed.chapter_coaching)) {
        return {
          coachingTips: (parsed.section_tips ?? []) as CoachingTip[],
          chapterCoaching: parsed.chapter_coaching ?? null,
        };
      }
      // Legacy format: CoachingTip[]
      return { coachingTips: Array.isArray(parsed) ? (parsed as CoachingTip[]) : [], chapterCoaching: null };
    } catch {
      return { coachingTips: [] as CoachingTip[], chapterCoaching: null };
    }
  }, [coachingJson]);

  // Reset dismissed tips when chapter changes
  useEffect(() => {
    setDismissedTips(new Set());
  }, [bookId, chapterNum]);

  const handleDismissTip = useCallback((afterSection: number) => {
    setDismissedTips((prev) => new Set(prev).add(afterSection));
  }, []);

  return { coachingTips, chapterCoaching, dismissedTips, handleDismissTip };
}
