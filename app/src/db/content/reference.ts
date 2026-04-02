/**
 * db/content/reference.ts — Word studies, synoptic passages, cross-refs, timelines, genealogy config.
 */

import { getDb } from '../database';
import type {
  WordStudy, SynopticEntry, CrossRefThread, CrossRefPair,
  TimelineEntry, GenealogyConfig,
} from '../../types';
import type { LexiconEntry } from '../../types/lexicon';

// ── Word Studies ────────────────────────────────────────────────────

export async function getAllWordStudies(): Promise<WordStudy[]> {
  return getDb().getAllAsync<WordStudy>(
    'SELECT * FROM word_studies ORDER BY transliteration'
  );
}

export async function getWordStudy(id: string): Promise<WordStudy | null> {
  return getDb().getFirstAsync<WordStudy>(
    'SELECT * FROM word_studies WHERE id = ?', [id]
  );
}

// ── Synoptic Passages ──────────────────────────────────────────────

export async function getSynopticEntries(): Promise<SynopticEntry[]> {
  return getDb().getAllAsync<SynopticEntry>(
    'SELECT * FROM synoptic_map ORDER BY title'
  );
}

export async function getSynopticEntry(id: string): Promise<SynopticEntry | null> {
  return getDb().getFirstAsync<SynopticEntry>(
    'SELECT * FROM synoptic_map WHERE id = ?',
    [id]
  );
}

// ── Cross-Reference Threads ────────────────────────────────────────

export async function getCrossRefThreads(): Promise<CrossRefThread[]> {
  return getDb().getAllAsync<CrossRefThread>(
    'SELECT * FROM cross_ref_threads ORDER BY theme'
  );
}

export async function getCrossRefThread(id: string): Promise<CrossRefThread | null> {
  return getDb().getFirstAsync<CrossRefThread>(
    'SELECT * FROM cross_ref_threads WHERE id = ?', [id]
  );
}

export async function getCrossRefPairsForVerse(verseRef: string): Promise<CrossRefPair[]> {
  return getDb().getAllAsync<CrossRefPair>(
    'SELECT * FROM cross_ref_pairs WHERE from_ref = ? OR to_ref = ?',
    [verseRef, verseRef]
  );
}

// ── Timeline ───────────────────────────────────────────────────────

export async function getTimelineEvents(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines WHERE category = ? ORDER BY year',
    ['event']
  );
}

export async function getTimelinePeople(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines WHERE category = ? ORDER BY year',
    ['person']
  );
}

export async function getAllTimelineEntries(): Promise<TimelineEntry[]> {
  return getDb().getAllAsync<TimelineEntry>(
    'SELECT * FROM timelines ORDER BY year'
  );
}

// ── Genealogy Config ───────────────────────────────────────────────

export async function getGenealogyConfig(key: string): Promise<string | null> {
  const row = await getDb().getFirstAsync<GenealogyConfig>(
    'SELECT * FROM genealogy_config WHERE key = ?', [key]
  );
  return row?.value_json ?? null;
}

/** Era configuration for timeline display. */
export interface EraConfig {
  hex: string;
  name: string;
  pill: string;
  range: [number, number];
}

/** Fetch era_config from DB (returns null if not present). */
export async function getTimelineEraConfig(): Promise<Record<string, EraConfig> | null> {
  const json = await getGenealogyConfig('timeline_era_config');
  if (!json) return null;
  try {
    return JSON.parse(json) as Record<string, EraConfig>;
  } catch {
    return null;
  }
}

// ── Lexicon ────────────────────────────────────────────────────────

export async function getLexiconEntry(strongs: string): Promise<LexiconEntry | null> {
  return getDb().getFirstAsync<LexiconEntry>(
    'SELECT * FROM lexicon_entries WHERE strongs = ?',
    [strongs]
  );
}

export async function getLexiconEntries(strongsList: string[]): Promise<LexiconEntry[]> {
  if (strongsList.length === 0) return [];
  const placeholders = strongsList.map(() => '?').join(',');
  return getDb().getAllAsync<LexiconEntry>(
    `SELECT * FROM lexicon_entries WHERE strongs IN (${placeholders})`,
    strongsList
  );
}
