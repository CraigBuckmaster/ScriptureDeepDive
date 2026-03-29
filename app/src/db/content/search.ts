/**
 * db/content/search.ts — Full-text search across verses and people.
 */

import { getDb } from '../database';
import type { Verse, Person } from '../../types';

/**
 * Sanitize user input for FTS5 MATCH queries.
 * Strips special characters, wraps each term in quotes (phrase matching),
 * and drops single-character terms. Returns empty string if nothing valid.
 */
function sanitizeFtsQuery(query: string): string {
  return query
    .replace(/["\*\(\)\{\}\[\]^~:]/g, '') // Strip FTS5 special chars
    .split(/\s+/)
    .filter((w) => w.length >= 2)
    .map((w) => `"${w}"`)                 // Quote each term (AND semantics)
    .join(' ');
}

export async function searchVerses(query: string, limit: number = 50): Promise<Verse[]> {
  const ftsQuery = sanitizeFtsQuery(query);
  if (!ftsQuery) return [];
  return getDb().getAllAsync<Verse>(
    `SELECT v.*, b.name as book_name FROM verses_fts f
     JOIN verses v ON v.id = f.rowid
     JOIN books b ON b.id = v.book_id
     WHERE f.text MATCH ?
     LIMIT ?`,
    [ftsQuery, limit]
  );
}

export async function searchPeople(query: string): Promise<Person[]> {
  const ftsQuery = sanitizeFtsQuery(query);
  if (!ftsQuery) return [];
  return getDb().getAllAsync<Person>(
    `SELECT p.* FROM people_fts f
     JOIN people p ON p.rowid = f.rowid
     WHERE f.name MATCH ?`,
    [ftsQuery]
  );
}
