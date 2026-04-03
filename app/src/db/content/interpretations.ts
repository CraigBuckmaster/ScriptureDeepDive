/**
 * db/content/interpretations.ts — Historical Interpretations query functions.
 *
 * Queries for the Time-Travel Reader: how passages were understood across
 * church history (patristic, medieval, Reformation, modern eras).
 */
import { getDb } from '../database';
import type { HistoricalInterpretation, InterpretationEra } from '../../types';

export async function getAllEras(): Promise<InterpretationEra[]> {
  return getDb().getAllAsync<InterpretationEra>(
    'SELECT * FROM interpretation_eras ORDER BY display_order'
  );
}

export async function getInterpretationsForVerse(
  verseRef: string,
): Promise<HistoricalInterpretation[]> {
  return getDb().getAllAsync<HistoricalInterpretation>(
    'SELECT * FROM historical_interpretations WHERE verse_ref = ? ORDER BY display_order',
    [verseRef]
  );
}

export async function getInterpretationsForChapter(
  bookId: string,
  chapterNum: number,
): Promise<HistoricalInterpretation[]> {
  const prefix = `${bookId} ${chapterNum}:%`;
  return getDb().getAllAsync<HistoricalInterpretation>(
    'SELECT * FROM historical_interpretations WHERE verse_ref LIKE ? ORDER BY display_order',
    [prefix]
  );
}

export async function getInterpretationsByEra(
  era: string,
): Promise<HistoricalInterpretation[]> {
  return getDb().getAllAsync<HistoricalInterpretation>(
    'SELECT * FROM historical_interpretations WHERE era = ? ORDER BY display_order',
    [era]
  );
}

export async function getInterpretation(
  id: string,
): Promise<HistoricalInterpretation | null> {
  return getDb().getFirstAsync<HistoricalInterpretation>(
    'SELECT * FROM historical_interpretations WHERE id = ?',
    [id]
  );
}
