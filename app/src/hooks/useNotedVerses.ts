/**
 * useNotedVerses — Returns the set of verse numbers that have notes
 * for a given chapter. Used by VerseBlock for note indicators.
 */

import { useState, useEffect } from 'react';
import { getNotesForChapter } from '../db/user';

export function useNotedVerses(bookId: string | null, chapterNum: number): Set<number> {
  const [noted, setNoted] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!bookId) return;
    getNotesForChapter(bookId, chapterNum).then((notes) => {
      const nums = new Set<number>();
      for (const n of notes) {
        // Extract verse num from "genesis 1:5" format
        const m = n.verse_ref.match(/:(\d+)/);
        if (m) nums.add(parseInt(m[1], 10));
      }
      setNoted(nums);
    });
  }, [bookId, chapterNum]);

  return noted;
}
