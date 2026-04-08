/**
 * useChapterHighlights — Loads highlights and builds a verseNum → hex color map.
 *
 * Extracted from ChapterScreen (#970).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getHighlightsForChapter, type VerseHighlight } from '../../db/user';
import { HIGHLIGHT_COLORS } from '../../components/HighlightColorPicker';

export function useChapterHighlights(bookId: string, chapterNum: number) {
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);

  const loadHighlights = useCallback(() => {
    if (bookId) getHighlightsForChapter(bookId, chapterNum).then(setHighlights);
  }, [bookId, chapterNum]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

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
