/**
 * db/content/extrabiblical.ts — Data access layer for the extrabiblical
 * table (HWGTB-P1-01 / #1538). Feeds the Extra-Biblical Index screen
 * (HWGTB-P2-02 / #1547) and the Extra-Biblical Detail screen
 * (HWGTB-P2-03 / #1548).
 *
 * The extrabiblical table is created by the pipeline changes in PR #1586.
 * Queries in this module guard against the table being absent so the app
 * still boots cleanly against an older scripture.db (e.g. pre-#1538
 * production builds).
 */

import { getDb } from '../database';
import { escapeLike } from '../../utils/escapeLike';
import type {
  ExtrabiblicalCategory,
  ExtrabiblicalRow,
  ExtrabiblicalSummary,
  ExtrabiblicalTraditionStatus,
} from '../../types';
import { logger } from '../../utils/logger';

// ── Defensive existence check ─────────────────────────────────

let tableExistsCache: boolean | null = null;

async function extrabiblicalTableExists(): Promise<boolean> {
  if (tableExistsCache !== null) return tableExistsCache;
  try {
    const row = await getDb().getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='extrabiblical'",
    );
    tableExistsCache = row !== null && row !== undefined;
  } catch {
    tableExistsCache = false;
  }
  return tableExistsCache;
}

/**
 * Test / migration hook — resets the memoized existence flag so the next
 * query re-checks sqlite_master. Public for jest tests that swap the DB.
 */
export function _resetExtrabiblicalTableCache(): void {
  tableExistsCache = null;
}

// ── Serialization helpers ─────────────────────────────────────

function safeParseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function parseTraditionStatus(raw: string): ExtrabiblicalTraditionStatus {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        protestant: String(parsed.protestant ?? ''),
        catholic: String(parsed.catholic ?? ''),
        eastern_orthodox: String(parsed.eastern_orthodox ?? ''),
        ethiopian_tewahedo: String(parsed.ethiopian_tewahedo ?? ''),
      };
    }
  } catch {
    // fall through
  }
  return {
    protestant: '',
    catholic: '',
    eastern_orthodox: '',
    ethiopian_tewahedo: '',
  };
}

function rowToSummary(row: ExtrabiblicalRow): ExtrabiblicalSummary {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    brief_summary: row.brief_summary,
    also_known_as: safeParseStringArray(row.also_known_as_json),
    tradition_status: parseTraditionStatus(row.tradition_status_json),
  };
}

// ── Queries ───────────────────────────────────────────────────

const SUMMARY_COLUMNS =
  'id, title, also_known_as_json, category, tradition_status_json, brief_summary';

/**
 * Every entry, sorted by category then title. Used by the Extra-Biblical
 * Index screen's initial render.
 */
export async function getAllExtraBiblical(): Promise<ExtrabiblicalSummary[]> {
  if (!(await extrabiblicalTableExists())) return [];
  try {
    const rows = await getDb().getAllAsync<ExtrabiblicalRow>(
      `SELECT ${SUMMARY_COLUMNS}
       FROM extrabiblical
       ORDER BY category, title`,
    );
    return rows.map(rowToSummary);
  } catch (err) {
    logger.error('db/extrabiblical', 'getAllExtraBiblical failed', err);
    return [];
  }
}

/**
 * Full-row lookup for the Extra-Biblical Detail screen (HWGTB-P2-03).
 * Returns null if the entry does not exist or the table is absent.
 */
export async function getExtraBiblicalById(
  id: string,
): Promise<ExtrabiblicalRow | null> {
  if (!(await extrabiblicalTableExists())) return null;
  try {
    const row = await getDb().getFirstAsync<ExtrabiblicalRow>(
      'SELECT * FROM extrabiblical WHERE id = ?',
      [id],
    );
    return row ?? null;
  } catch (err) {
    logger.error('db/extrabiblical', 'getExtraBiblicalById failed', err);
    return null;
  }
}

/**
 * Title / also_known_as / id search. Case-insensitive LIKE matching; the
 * also_known_as array is serialized JSON so we match against the serialized
 * string (identical alias tokens are rare enough that this is acceptable).
 * Returns [] when the query is empty or the table is absent.
 */
export async function searchExtraBiblical(
  query: string,
): Promise<ExtrabiblicalSummary[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  if (!(await extrabiblicalTableExists())) return [];
  const needle = `%${escapeLike(trimmed).toLowerCase()}%`;
  try {
    const rows = await getDb().getAllAsync<ExtrabiblicalRow>(
      `SELECT ${SUMMARY_COLUMNS}
       FROM extrabiblical
       WHERE LOWER(title) LIKE ? ESCAPE '\\'
          OR LOWER(id) LIKE ? ESCAPE '\\'
          OR LOWER(IFNULL(also_known_as_json, '')) LIKE ? ESCAPE '\\'
       ORDER BY category, title`,
      [needle, needle, needle],
    );
    return rows.map(rowToSummary);
  } catch (err) {
    logger.error('db/extrabiblical', 'searchExtraBiblical failed', err);
    return [];
  }
}

/**
 * All entries within a single category, sorted by title. Used when the
 * index screen's filter chip narrows by category.
 */
export async function getExtraBiblicalByCategory(
  category: ExtrabiblicalCategory,
): Promise<ExtrabiblicalSummary[]> {
  if (!(await extrabiblicalTableExists())) return [];
  try {
    const rows = await getDb().getAllAsync<ExtrabiblicalRow>(
      `SELECT ${SUMMARY_COLUMNS}
       FROM extrabiblical
       WHERE category = ?
       ORDER BY title`,
      [category],
    );
    return rows.map(rowToSummary);
  } catch (err) {
    logger.error('db/extrabiblical', 'getExtraBiblicalByCategory failed', err);
    return [];
  }
}
