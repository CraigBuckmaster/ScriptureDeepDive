import { useState, useEffect, useCallback } from 'react';
import { getHighlightsForChapter, setHighlight, removeHighlight } from '../db/user';

export function useHighlightsForChapter(bookId: string | null, ch: number) {
  const [highlights, setHighlights] = useState<Map<number, string>>(new Map());

  const reload = useCallback(() => {
    if (!bookId) return;
    getHighlightsForChapter(bookId, ch).then((hl) => {
      const map = new Map<number, string>();
      for (const h of hl) {
        const m = h.verse_ref.match(/:(\d+)/);
        if (m) map.set(parseInt(m[1], 10), h.color);
      }
      setHighlights(map);
    });
  }, [bookId, ch]);

  useEffect(() => { reload(); }, [reload]);

  const toggleHighlight = useCallback(async (verseNum: number, color: string | null) => {
    if (!bookId) return;
    const ref = `${bookId} ${ch}:${verseNum}`;
    if (color) await setHighlight(ref, color);
    else await removeHighlight(ref);
    reload();
  }, [bookId, ch, reload]);

  return { highlights, toggleHighlight };
}
