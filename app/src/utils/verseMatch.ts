/**
 * utils/verseMatch.ts — Pairs primary and comparison verses by verse_num.
 */

import type { Verse } from '../types';

export interface VersePair {
  primary: Verse;
  comparison: Verse | null;
}

export function matchVerses(primary: Verse[], comparison: Verse[]): VersePair[] {
  const compMap = new Map(comparison.map(v => [v.verse_num, v]));
  return primary.map(v => ({
    primary: v,
    comparison: compMap.get(v.verse_num) ?? null,
  }));
}
