/**
 * db/content/contentLibrary.ts — Queries for the content_library table.
 *
 * Provides category counts, filtered listing, and search across
 * the build-time content library index.
 */

import { getDb } from '../database';
import type { ContentLibraryEntry } from '../../types';

/** Get row counts per category (only categories with entries > 0). */
export async function getContentLibraryCounts(): Promise<Record<string, number>> {
  const rows = await getDb().getAllAsync<{ category: string; cnt: number }>(
    'SELECT category, COUNT(*) as cnt FROM content_library GROUP BY category'
  );
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.category] = row.cnt;
  }
  return counts;
}

/** Get all entries for a category, optionally filtered by testament. */
export async function getContentLibrary(
  category: string,
  testament?: 'ot' | 'nt',
): Promise<ContentLibraryEntry[]> {
  if (testament) {
    return getDb().getAllAsync<ContentLibraryEntry>(
      'SELECT * FROM content_library WHERE category = ? AND testament = ? ORDER BY sort_order',
      [category, testament],
    );
  }
  return getDb().getAllAsync<ContentLibraryEntry>(
    'SELECT * FROM content_library WHERE category = ? ORDER BY sort_order',
    [category],
  );
}

/** Search entries within a category by title and preview text. */
export async function searchContentLibrary(
  query: string,
  category: string,
): Promise<ContentLibraryEntry[]> {
  const like = `%${query}%`;
  return getDb().getAllAsync<ContentLibraryEntry>(
    'SELECT * FROM content_library WHERE category = ? AND (title LIKE ? OR preview LIKE ?) ORDER BY sort_order',
    [category, like, like],
  );
}
