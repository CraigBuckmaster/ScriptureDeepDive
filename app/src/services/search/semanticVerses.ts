/**
 * services/search/semanticVerses.ts — Semantic verse lane for universal
 * search (#1876, Epic E #1867).
 *
 * Composes the existing Amicus retrieval primitives — embedQuery (proxy
 * /ai/embed) → searchByVector (sqlite-vec) — then hydrates the chunks'
 * verse anchors into real Verse rows. Chunks index panel/word-study/debate
 * content, not raw verse text, so a chunk's (book_id, chapter_num,
 * verse_start) anchor is the semantic pointer back into Scripture.
 *
 * Also exports mergeVersesRRF, the Reciprocal Rank Fusion merge used by
 * useSearch to combine this lane with FTS verse results.
 *
 * Errors: embedQuery/searchByVector throw AmicusError (OFFLINE,
 * PROXY_UNAUTHORIZED, EMBED_FAILED, EXTENSION_NOT_LOADED). Callers treat
 * any failure as "semantic lane unavailable" and fall back to FTS-only.
 */

import { embedQuery } from '../amicus/embed';
import { searchByVector } from '../amicus/vectorSearch';
import { getVerse } from '../../db/content';
import { formatVerseRef } from '../../utils/verseRef';
import type { Verse } from '../../types';

/** Chunk candidates to pull from sqlite-vec before verse hydration. */
const CHUNK_LIMIT = 24;

/** Maximum verses the semantic lane contributes to the merge. */
const MAX_RESULTS = 12;

/**
 * Reciprocal Rank Fusion constant. k=60 is the standard from the original
 * RRF paper — small enough that top ranks dominate, large enough that a
 * result appearing in both lanes beats a lone #1.
 */
export const RRF_K = 60;

export interface SearchVersesSemanticOptions {
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  /**
   * Per-attempt embed timeout. Tighter than embed's 5s default because
   * this lane sits inside the search Promise.all — a slow proxy should
   * degrade to FTS-only, not stall the whole result set.
   */
  timeoutMs?: number;
}

/**
 * Semantic verse search: embed the query, vector-search the chunk index,
 * hydrate each chunk's verse anchor. Results keep vector-rank order and
 * are deduped by verse ref.
 *
 * Throws AmicusError on embed/vector failure — callers own the fallback.
 */
export async function searchVersesSemantic(
  query: string,
  authToken: string,
  opts: SearchVersesSemanticOptions = {},
): Promise<Verse[]> {
  const vector = await embedQuery(query, {
    authToken,
    fetchImpl: opts.fetchImpl,
    timeoutMs: opts.timeoutMs ?? 2500,
  });

  const chunks = await searchByVector(vector, { limit: CHUNK_LIMIT });

  // Chunk anchors → unique verse refs, preserving vector-rank order.
  const seen = new Set<string>();
  const anchors: Array<{ bookId: string; ch: number; v: number }> = [];
  for (const chunk of chunks) {
    const { book_id, chapter_num, verse_start } = chunk.metadata;
    if (!book_id || !chapter_num || !verse_start) continue;
    const ref = formatVerseRef(book_id, chapter_num, verse_start);
    if (seen.has(ref)) continue;
    seen.add(ref);
    anchors.push({ bookId: book_id, ch: chapter_num, v: verse_start });
    if (anchors.length >= MAX_RESULTS) break;
  }

  // Hydrate to Verse rows (default translation, matching the FTS lane).
  const rows = await Promise.all(anchors.map((a) => getVerse(a.bookId, a.ch, a.v)));
  return rows.filter((r): r is Verse => r !== null);
}

/**
 * Merge FTS and semantic verse lists with Reciprocal Rank Fusion:
 *   score(ref) = Σ over lanes containing ref of 1 / (k + rank)
 * (rank is 1-based within each lane). Deduped by verse ref; the FTS row
 * instance wins when both lanes carry the same ref. Ties break toward
 * the FTS lane's original order, keeping the merge stable.
 */
export function mergeVersesRRF(
  ftsVerses: Verse[],
  semanticVerses: Verse[],
  k: number = RRF_K,
): Verse[] {
  interface Entry {
    verse: Verse;
    score: number;
    ftsRank: number;
    semanticRank: number;
  }
  const entries = new Map<string, Entry>();

  ftsVerses.forEach((verse, i) => {
    const ref = formatVerseRef(verse.book_id, verse.chapter_num, verse.verse_num);
    const rank = i + 1;
    const existing = entries.get(ref);
    if (existing) return; // duplicate ref within the FTS lane itself
    entries.set(ref, {
      verse,
      score: 1 / (k + rank),
      ftsRank: rank,
      semanticRank: Number.POSITIVE_INFINITY,
    });
  });

  semanticVerses.forEach((verse, i) => {
    const ref = formatVerseRef(verse.book_id, verse.chapter_num, verse.verse_num);
    const rank = i + 1;
    const existing = entries.get(ref);
    if (existing) {
      if (Number.isFinite(existing.semanticRank)) return; // dup within lane
      existing.score += 1 / (k + rank);
      existing.semanticRank = rank;
    } else {
      entries.set(ref, {
        verse,
        score: 1 / (k + rank),
        ftsRank: Number.POSITIVE_INFINITY,
        semanticRank: rank,
      });
    }
  });

  return [...entries.values()]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.ftsRank !== b.ftsRank) return a.ftsRank - b.ftsRank;
      return a.semanticRank - b.semanticRank;
    })
    .map((e) => e.verse);
}

export const _internal = { CHUNK_LIMIT, MAX_RESULTS };
