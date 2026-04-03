/**
 * useInterpretations — Hooks for Time-Travel Reader data.
 *
 * Provides era metadata and historical interpretations for verses/chapters.
 */
import { useAsyncData } from './useAsyncData';
import {
  getAllEras,
  getInterpretationsForVerse,
  getInterpretationsForChapter,
} from '../db/content/interpretations';
import type { InterpretationEra, HistoricalInterpretation } from '../types';

export function useInterpretationEras() {
  return useAsyncData<InterpretationEra[]>(getAllEras, [], []);
}

export function useVerseInterpretations(verseRef: string) {
  return useAsyncData<HistoricalInterpretation[]>(
    () => getInterpretationsForVerse(verseRef),
    [verseRef],
    [],
  );
}

export function useChapterInterpretations(bookId: string, chapterNum: number) {
  return useAsyncData<HistoricalInterpretation[]>(
    () => getInterpretationsForChapter(bookId, chapterNum),
    [bookId, chapterNum],
    [],
  );
}
