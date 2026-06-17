/**
 * useChapterHighlights — Loads highlights and builds a verseNum → hex color map.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getHighlightsForChapter, type VerseHighlight } from '../../db/user';
import { HIGHLIGHT_COLORS } from '../../components/HighlightColorPicker';
import { logger } from '../../utils/logger';

export function useChapterHighlights(bookId: string, chapterNum: number) {
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);

  // Manual reload (e.g. after the user adds a highlight). Errors are logged,
  // not thrown, to avoid an unhandled rejection.
  const loadHighlights = useCallback(() => {
    if (!bookId) return;
    getHighlightsForChapter(bookId, chapterNum)
      .then(setHighlights)
      .catch((err) => logger.warn('useChapterHighlights', 'reload failed', err));
  }, [bookId, chapterNum]);

  // Auto-load on chapter change, guarded so a slow load for a previous chapter
  // can't overwrite the current chapter's highlights after a fast switch.
  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    getHighlightsForChapter(bookId, chapterNum)
      .then((h) => { if (!cancelled) setHighlights(h); })
      .catch((err) => { if (!cancelled) logger.warn('useChapterHighlights', 'load failed', err); });
    return () => { cancelled = true; };
  }, [bookId, chapterNum]);

  // Build verseNum → highlight hex color map for rendering
  const highlightMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of highlights) {
      const parts = h.verse_ref.split(':');
      const num = parts[1] ? parseInt(parts[1], 10) : NaN;
      if (!isNaN(num)) {
        const entry = HIGHLIGHT_COLORS.find((c) => c.name === h.color);
        if (entry) map.set(num, entry.hex);
      }
    }
    return map;
  }, [highlights]);

  return { highlights, highlightMap, loadHighlights };
}
