/**
 * db/content/dictionary.ts — SQLite queries for Bible Dictionary entries.
 */

import { getDb } from '../database';
import type { DictionaryEntry } from '../../types/dictionary';

export async function getAllDictionaryEntries(): Promise<DictionaryEntry[]> {
  return getDb().getAllAsync<DictionaryEntry>(
    'SELECT * FROM dictionary_entries ORDER BY term COLLATE NOCASE'
  );
}

export async function getDictionaryEntry(id: string): Promise<DictionaryEntry | null> {
  return getDb().getFirstAsync<DictionaryEntry>(
    'SELECT * FROM dictionary_entries WHERE id = ?',
    [id]
  );
}

export async function searchDictionary(query: string): Promise<DictionaryEntry[]> {
  return getDb().getAllAsync<DictionaryEntry>(
    `SELECT de.* FROM dictionary_fts fts
     JOIN dictionary_entries de ON de.rowid = fts.rowid
     WHERE dictionary_fts MATCH ?
     ORDER BY rank LIMIT 50`,
    [query + '*']
  );
}

export async function getDictionaryEntriesByIds(ids: string[]): Promise<DictionaryEntry[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDb().getAllAsync<DictionaryEntry>(
    `SELECT * FROM dictionary_entries WHERE id IN (${placeholders}) ORDER BY term COLLATE NOCASE`,
    ids
  );
}
