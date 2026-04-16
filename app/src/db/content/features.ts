/**
 * db/content/features.ts — Prophecy chains, concepts, difficult passages, journeys.
 */

import { getDb } from '../database';
import type { ProphecyChain, Concept, DifficultPassage, Journey, JourneyStop, JourneyTag } from '../../types';
import { escapeLike } from '../../utils/escapeLike';

// ── Prophecy Chains ────────────────────────────────────────────────

export async function getAllProphecyChains(): Promise<ProphecyChain[]> {
  return getDb().getAllAsync<ProphecyChain>(
    'SELECT * FROM prophecy_chains ORDER BY title'
  );
}

export async function getProphecyChain(id: string): Promise<ProphecyChain | null> {
  return getDb().getFirstAsync<ProphecyChain>(
    'SELECT * FROM prophecy_chains WHERE id = ?',
    [id]
  );
}

export async function getProphecyChainsByCategory(category: string): Promise<ProphecyChain[]> {
  return getDb().getAllAsync<ProphecyChain>(
    'SELECT * FROM prophecy_chains WHERE category = ? ORDER BY title',
    [category]
  );
}

/**
 * Find prophecy chains that reference a specific chapter.
 * Uses LIKE on JSON — fine for <200 rows.
 */
export async function getProphecyChainsForChapter(
  bookDir: string, chapterNum: number
): Promise<ProphecyChain[]> {
  const safeBook = escapeLike(bookDir);
  return getDb().getAllAsync<ProphecyChain>(
    `SELECT * FROM prophecy_chains
     WHERE links_json LIKE ? ESCAPE '\\' AND links_json LIKE ? ESCAPE '\\'`,
    [`%"book_dir":"${safeBook}"%`, `%"chapter_num":${Number(chapterNum)}%`]
  );
}

// ── Concepts ───────────────────────────────────────────────────────

export async function getAllConcepts(): Promise<Concept[]> {
  return getDb().getAllAsync<Concept>(
    'SELECT *, title AS name FROM concepts ORDER BY title'
  );
}

export async function getConcept(id: string): Promise<Concept | null> {
  return getDb().getFirstAsync<Concept>(
    'SELECT *, title AS name FROM concepts WHERE id = ?',
    [id]
  );
}

// ── Difficult Passages ─────────────────────────────────────────────

export async function getAllDifficultPassages(): Promise<DifficultPassage[]> {
  return getDb().getAllAsync<DifficultPassage>(
    'SELECT * FROM difficult_passages ORDER BY title'
  );
}

export async function getDifficultPassage(id: string): Promise<DifficultPassage | null> {
  return getDb().getFirstAsync<DifficultPassage>(
    'SELECT * FROM difficult_passages WHERE id = ?',
    [id]
  );
}

export async function getDifficultPassagesByCategory(category: string): Promise<DifficultPassage[]> {
  return getDb().getAllAsync<DifficultPassage>(
    'SELECT * FROM difficult_passages WHERE category = ? ORDER BY title',
    [category]
  );
}

/**
 * Find difficult passages that reference a specific chapter.
 * Uses LIKE on JSON — fine for <200 rows.
 */
export async function getDifficultPassagesForChapter(
  bookDir: string, chapterNum: number
): Promise<DifficultPassage[]> {
  const safeBook = escapeLike(bookDir);
  return getDb().getAllAsync<DifficultPassage>(
    `SELECT * FROM difficult_passages
     WHERE related_chapters_json LIKE ? ESCAPE '\\' AND related_chapters_json LIKE ? ESCAPE '\\'`,
    [`%"book_dir":"${safeBook}"%`, `%"chapter_num":${Number(chapterNum)}%`]
  );
}

// ── Journeys (#1379) ──────────────────────────────────────────────

export async function getJourney(id: string): Promise<Journey | null> {
  return getDb().getFirstAsync<Journey>(
    'SELECT * FROM journeys WHERE id = ?',
    [id]
  );
}

export async function getJourneyStops(journeyId: string): Promise<JourneyStop[]> {
  return getDb().getAllAsync<JourneyStop>(
    'SELECT * FROM journey_stops WHERE journey_id = ? ORDER BY stop_order',
    [journeyId]
  );
}

export async function getJourneyTags(journeyId: string): Promise<JourneyTag[]> {
  return getDb().getAllAsync<JourneyTag>(
    'SELECT * FROM journey_tags WHERE journey_id = ?',
    [journeyId]
  );
}

export async function getAllJourneys(): Promise<Journey[]> {
  return getDb().getAllAsync<Journey>(
    'SELECT * FROM journeys ORDER BY journey_type, sort_order, title'
  );
}

export async function getJourneysByType(journeyType: string): Promise<Journey[]> {
  return getDb().getAllAsync<Journey>(
    'SELECT * FROM journeys WHERE journey_type = ? ORDER BY sort_order, title',
    [journeyType]
  );
}

export async function getJourneysByLens(lensId: string): Promise<Journey[]> {
  return getDb().getAllAsync<Journey>(
    'SELECT * FROM journeys WHERE lens_id = ? ORDER BY sort_order, title',
    [lensId]
  );
}
