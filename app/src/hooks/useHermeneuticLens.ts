/**
 * useHermeneuticLens — Hooks for hermeneutic lens feature.
 */

import { getLensesForChapter, getChapterLensContent } from '../db/content/hermeneutics';
import type { HermeneuticLens, ChapterLensContent } from '../types';
import { useAsyncData } from './useAsyncData';

/**
 * Returns the lenses that have content for the given chapter.
 */
export function useAvailableLenses(chapterId: string | undefined) {
  return useAsyncData<HermeneuticLens[]>(
    () => (chapterId ? getLensesForChapter(chapterId) : Promise.resolve([])),
    [chapterId],
    [],
  );
}

/**
 * Returns the guidance and panel filter/order for a specific lens on a chapter.
 */
export function useChapterLensContent(
  chapterId: string | undefined,
  lensId: string | null,
) {
  return useAsyncData<ChapterLensContent | null>(
    () =>
      chapterId && lensId
        ? getChapterLensContent(chapterId, lensId)
        : Promise.resolve(null),
    [chapterId, lensId],
    null,
  );
}
