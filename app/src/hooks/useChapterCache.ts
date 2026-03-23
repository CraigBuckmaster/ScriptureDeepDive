/**
 * useChapterCache — Pre-fetches adjacent chapters for instant transitions.
 * On mount, loads prev/next chapter data into a WeakRef cache Map.
 */

import { useEffect, useRef } from 'react';
import { getChapter, getSections, getSectionPanels, getVerses } from '../db/content';
import { useSettingsStore } from '../stores';

const cache = new Map<string, any>();

export function useChapterCache(bookId: string | null, chapterNum: number, totalChapters: number) {
  const translation = useSettingsStore((s) => s.translation);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!bookId) return;

    const prefetch = async (ch: number) => {
      const key = `${bookId}_${ch}_${translation}`;
      if (cache.has(key)) return;

      const chapter = await getChapter(bookId, ch);
      if (!chapter || !mountedRef.current) return;

      const sections = await getSections(chapter.id);
      const verses = await getVerses(bookId, ch, translation);

      if (mountedRef.current) {
        cache.set(key, { chapter, sections, verses });
        // Keep cache bounded
        if (cache.size > 6) {
          const oldest = cache.keys().next().value;
          if (oldest) cache.delete(oldest);
        }
      }
    };

    // Prefetch adjacent chapters after a short delay
    const timer = setTimeout(() => {
      if (chapterNum > 1) prefetch(chapterNum - 1);
      if (chapterNum < totalChapters) prefetch(chapterNum + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookId, chapterNum, totalChapters, translation]);
}

export function getCachedChapter(bookId: string, ch: number, translation: string) {
  return cache.get(`${bookId}_${ch}_${translation}`) ?? null;
}
