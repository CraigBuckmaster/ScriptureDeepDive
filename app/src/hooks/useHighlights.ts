import { useState, useEffect, useCallback, useRef } from 'react';
import { getHighlightsForChapter, setHighlight, removeHighlight } from '../db/user';
import { formatVerseRef, extractVerseNum } from '../utils/verseRef';

export function useHighlightsForChapter(bookId: string | null, ch: number) {
  const [highlights, setHighlights] = useState<Map<number, string>>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const reload = useCallback(() => {
    if (!bookId) return;
    getHighlightsForChapter(bookId, ch).then((hl) => {
      if (!mountedRef.current) return;
      const map = new Map<number, string>();
      for (const h of hl) {
        const v = extractVerseNum(h.verse_ref);
        if (v) map.set(v, h.color);
      }
      setHighlights(map);
    });
  }, [bookId, ch]);

  useEffect(() => {
    let cancelled = false;
    if (!bookId) return;
    getHighlightsForChapter(bookId, ch).then((hl) => {
      if (cancelled) return;
      const map = new Map<number, string>();
      for (const h of hl) {
        const v = extractVerseNum(h.verse_ref);
        if (v) map.set(v, h.color);
      }
      setHighlights(map);
    });
    return () => { cancelled = true; };
  }, [bookId, ch]);

  const toggleHighlight = useCallback(async (verseNum: number, color: string | null) => {
    if (!bookId) return;
    const ref = formatVerseRef(bookId, ch, verseNum);
    if (color) await setHighlight(ref, color);
    else await removeHighlight(ref);
    reload();
  }, [bookId, ch, reload]);

  return { highlights, toggleHighlight };
}
