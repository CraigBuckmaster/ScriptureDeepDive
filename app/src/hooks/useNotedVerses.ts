/**
 * useNotedVerses — Returns the set of verse numbers that have notes
 * for a given chapter. Used by VerseBlock for note indicators.
 */

import { useState, useEffect } from 'react';
import { getNotesForChapter } from '../db/user';
import { extractVerseNum } from '../utils/verseRef';

export function useNotedVerses(bookId: string | null, chapterNum: number): Set<number> {
  const [noted, setNoted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!bookId) return;
    getNotesForChapter(bookId, chapterNum).then((notes) => {
      const nums = new Set<number>();
      for (const n of notes) {
        const v = extractVerseNum(n.verse_ref);
        if (v) nums.add(v);
      }
      setNoted(nums);
    });
  }, [bookId, chapterNum]);

  return noted;
}
