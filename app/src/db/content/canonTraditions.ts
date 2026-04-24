/**
 * db/content/canonTraditions.ts — Data access layer for canon_traditions
 * (HWGTB-P1-02 / #1539). Feeds the Canon Comparison screen
 * (HWGTB-P3-01 / #1550).
 *
 * The canon_traditions table is created by the pipeline in PR #1587.
 * Queries here guard against the table being absent so the app still
 * boots cleanly against a pre-#1539 scripture.db — returning [] / null
 * rather than throwing.
 */

import { getDb } from '../database';
import type {
  CanonDistinctive,
  CanonFormationEvent,
  CanonListSection,
  CanonTradition,
  CanonTraditionRow,
} from '../../types';
import { logger } from '../../utils/logger';

// ── Defensive existence check ─────────────────────────────────

let tableExistsCache: boolean | null = null;

async function canonTraditionsTableExists(): Promise<boolean> {
  if (tableExistsCache !== null) return tableExistsCache;
  try {
    const row = await getDb().getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='canon_traditions'",
    );
    tableExistsCache = row !== null && row !== undefined;
  } catch {
    tableExistsCache = false;
  }
  return tableExistsCache;
}

/** Test / migration hook — resets the memoized flag. */
export function _resetCanonTraditionsTableCache(): void {
  tableExistsCache = null;
}

// ── Parsers ───────────────────────────────────────────────────

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function rowToTradition(row: CanonTraditionRow): CanonTradition {
  return {
    id: row.id,
    label: row.label,
    book_count: row.book_count,
    short_description: row.short_description,
    canon_list: safeParseArray<CanonListSection>(row.canon_list_json),
    distinctives: safeParseArray<CanonDistinctive>(row.distinctives_json),
    formation_events: safeParseArray<CanonFormationEvent>(row.formation_events_json),
    sort_order: row.sort_order,
  };
}

// ── Queries ───────────────────────────────────────────────────

/**
 * Every tradition, sorted by sort_order then label. Used by the
 * Canon Comparison screen.
 */
export async function getAllCanonTraditions(): Promise<CanonTradition[]> {
  if (!(await canonTraditionsTableExists())) return [];
  try {
    const rows = await getDb().getAllAsync<CanonTraditionRow>(
      `SELECT id, label, book_count, short_description,
              canon_list_json, distinctives_json, formation_events_json,
              sort_order
       FROM canon_traditions
       ORDER BY sort_order, label`,
    );
    return rows.map(rowToTradition);
  } catch (err) {
    logger.error('db/canonTraditions', 'getAllCanonTraditions failed', err);
    return [];
  }
}

/** Single-tradition lookup — useful for deep-linking into one column. */
export async function getCanonTraditionById(
  id: string,
): Promise<CanonTradition | null> {
  if (!(await canonTraditionsTableExists())) return null;
  try {
    const row = await getDb().getFirstAsync<CanonTraditionRow>(
      `SELECT id, label, book_count, short_description,
              canon_list_json, distinctives_json, formation_events_json,
              sort_order
       FROM canon_traditions WHERE id = ?`,
      [id],
    );
    return row ? rowToTradition(row) : null;
  } catch (err) {
    logger.error('db/canonTraditions', 'getCanonTraditionById failed', err);
    return null;
  }
}
