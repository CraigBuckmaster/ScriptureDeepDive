/**
 * db/content/features.ts — Prophecy chains, concepts, difficult passages.
 */

import { getDb } from '../database';
import type { ProphecyChain, Concept, DifficultPassage } from '../../types';

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
  return getDb().getAllAsync<ProphecyChain>(
    `SELECT * FROM prophecy_chains
     WHERE links_json LIKE ? AND links_json LIKE ?`,
    [`%"book_dir":"${bookDir}"%`, `%"chapter_num":${chapterNum}%`]
  );
}

// ── Concepts ───────────────────────────────────────────────────────

export async function getAllConcepts(): Promise<Concept[]> {
  return getDb().getAllAsync<Concept>(
    'SELECT * FROM concepts ORDER BY name'
  );
}

export async function getConcept(id: string): Promise<Concept | null> {
  return getDb().getFirstAsync<Concept>(
    'SELECT * FROM concepts WHERE id = ?',
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
  return getDb().getAllAsync<DifficultPassage>(
    `SELECT * FROM difficult_passages
     WHERE related_chapters_json LIKE ? AND related_chapters_json LIKE ?`,
    [`%"book_dir":"${bookDir}"%`, `%"chapter_num":${chapterNum}%`]
  );
}
