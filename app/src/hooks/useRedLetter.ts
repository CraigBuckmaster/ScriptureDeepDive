/**
 * hooks/useRedLetter.ts — Load red-letter verse numbers for a chapter.
 *
 * Returns a Set<number> of verse numbers where Jesus is speaking.
 * Returns empty set when disabled in settings or for books with no red letter data.
 */

import { useState, useEffect } from 'react';
import { getRedLetterVerses } from '../db/content';
import { useSettingsStore } from '../stores';

export function useRedLetter(bookId: string | null, chapterNum: number): Set<number> {
  const enabled = useSettingsStore((s) => s.redLetterEnabled);
  const [verses, setVerses] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!bookId || !enabled) {
      setVerses(new Set());
      return;
    }

    let cancelled = false;
    getRedLetterVerses(bookId, chapterNum).then((nums) => {
      if (!cancelled) setVerses(new Set(nums));
    });
    return () => { cancelled = true; };
  }, [bookId, chapterNum, enabled]);

  return verses;
}
