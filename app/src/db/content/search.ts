/**
 * db/content/search.ts — Full-text search across verses and people.
 */

import { getDb, getVerseDb } from '../database';
import { isBundled } from '../translationRegistry';
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

export async function searchVerses(
  query: string,
  limit: number = 50,
  testament?: 'ot' | 'nt' | null,
  bookId?: string | null,
  translation?: string,
): Promise<Verse[]> {
  const ftsQuery = sanitizeFtsQuery(query);
  if (!ftsQuery) return [];

  // Supplemental translations have their own DB with FTS but no books table,
  // so we use a simpler query and join books from the core DB after.
  if (translation && !isBundled(translation)) {
    const db = await getVerseDb(translation);
    let sql = `SELECT v.* FROM verses_fts f
       JOIN verses v ON v.id = f.rowid
       WHERE f.text MATCH ?`;
    const params: (string | number)[] = [ftsQuery];

    if (bookId) {
      sql += ' AND v.book_id = ?';
      params.push(bookId);
    }

    sql += ' LIMIT ?';
    params.push(limit);

    return db.getAllAsync<Verse>(sql, params);
  }

  // Bundled translations: use core DB with books join for testament filter
  let sql = `SELECT v.*, b.name as book_name FROM verses_fts f
     JOIN verses v ON v.id = f.rowid
     JOIN books b ON b.id = v.book_id
     WHERE f.text MATCH ?`;
  const params: (string | number)[] = [ftsQuery];

  if (bookId) {
    sql += ' AND v.book_id = ?';
    params.push(bookId);
  } else if (testament === 'ot' || testament === 'nt') {
    sql += ' AND b.testament = ?';
    params.push(testament);
  }

  sql += ' LIMIT ?';
  params.push(limit);

  return getDb().getAllAsync<Verse>(sql, params);
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
