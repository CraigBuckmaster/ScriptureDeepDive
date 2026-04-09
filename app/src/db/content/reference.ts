/**
 * db/content/reference.ts — Word studies, synoptic passages, cross-refs, timelines, genealogy config.
 */

import { getDb } from '../database';
import type {
  WordStudy, SynopticEntry, CrossRefThread, CrossRefPair,
  TimelineEntry, GenealogyConfig,
} from '../../types';
import type { LexiconEntry } from '../../types/lexicon';
import type { Topic } from '../../types/topic';

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
    'SELECT * FROM synoptic_map ORDER BY sort_order ASC, title'
  );
}

export async function getSynopticEntry(id: string): Promise<SynopticEntry | null> {
  return getDb().getFirstAsync<SynopticEntry>(
    'SELECT * FROM synoptic_map WHERE id = ?',
    [id]
  );
}

export async function getHarmonyEntries(): Promise<SynopticEntry[]> {
  return getDb().getAllAsync<SynopticEntry>(
    `SELECT * FROM synoptic_map
     WHERE category IN ('gospel', 'gospel-luke', 'gospel-john')
     ORDER BY sort_order ASC`
  );
}

export async function getHarmonyEntry(id: string): Promise<SynopticEntry | null> {
  return getDb().getFirstAsync<SynopticEntry>(
    'SELECT * FROM synoptic_map WHERE id = ?',
    [id]
  );
}

export async function getOTParallelEntries(): Promise<SynopticEntry[]> {
  return getDb().getAllAsync<SynopticEntry>(
    `SELECT * FROM synoptic_map
     WHERE category = 'ot-parallel'
     ORDER BY sort_order ASC`
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

// ── Eras (enriched era_config — #1115) ────────────────────────────

/** Row from the `eras` table with enriched narrative data. */
export interface EraRow {
  id: string;
  name: string;
  pill: string | null;
  hex: string | null;
  range_start: number | null;
  range_end: number | null;
  summary: string | null;
  narrative: string | null;
  key_themes: string | null;   // JSON array
  key_people: string | null;   // JSON array
  books: string | null;        // JSON array
  chapter_range: string | null;
  geographic_center: string | null;
  redemptive_thread: string | null;
  transition_to_next: string | null;
}

/** Fetch all eras ordered by range_start (chronological). */
export async function getEras(): Promise<EraRow[]> {
  return getDb().getAllAsync<EraRow>(
    'SELECT * FROM eras ORDER BY range_start'
  );
}

/** Fetch a single era by ID. */
export async function getEra(id: string): Promise<EraRow | null> {
  return getDb().getFirstAsync<EraRow>(
    'SELECT * FROM eras WHERE id = ?', [id]
  );
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

// ── Topics ────────────────────────────────────────────────────────

export async function getTopics(): Promise<Topic[]> {
  return getDb().getAllAsync<Topic>(
    'SELECT * FROM topics ORDER BY category, title'
  );
}

export async function getTopic(topicId: string): Promise<Topic | null> {
  return getDb().getFirstAsync<Topic>(
    'SELECT * FROM topics WHERE id = ?',
    [topicId]
  );
}

export async function searchTopics(query: string): Promise<Topic[]> {
  return getDb().getAllAsync<Topic>(
    `SELECT t.* FROM topics t
     JOIN topics_fts fts ON t.rowid = fts.rowid
     WHERE topics_fts MATCH ?
     ORDER BY rank
     LIMIT 30`,
    [query + '*']
  );
}
