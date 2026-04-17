/**
 * services/amicus/vectorSearch.ts — sqlite-vec query layer.
 *
 * Runs the vec0 MATCH search against scripture.db and joins chunk_text +
 * chunk_metadata to produce typed results. Keeps the raw-SQL surface
 * localized so the orchestrator doesn't need to know the schema.
 */
import { AmicusError, type ChunkSourceType, type RetrievedChunk } from './types';
import { getDb } from '@/db/database';
import { logger } from '@/utils/logger';

export interface VectorSearchRow {
  chunk_id: string;
  source_type: ChunkSourceType;
  source_id: string;
  text: string;
  distance: number;
  scholar_id: string | null;
  tradition: string | null;
  book_id: string | null;
  chapter_num: number | null;
  verse_start: number | null;
  verse_end: number | null;
  panel_type: string | null;
}

/**
 * Pack a number[] vector into a little-endian float32 Uint8Array blob
 * suitable for a sqlite-vec MATCH parameter.
 */
export function packVector(vector: number[]): Uint8Array {
  const buf = new ArrayBuffer(vector.length * 4);
  const view = new DataView(buf);
  for (let i = 0; i < vector.length; i++) {
    view.setFloat32(i * 4, vector[i]!, true /* littleEndian */);
  }
  return new Uint8Array(buf);
}

/**
 * Convert sqlite-vec's L2 distance into a similarity score in [0, 1].
 * The raw distance is unbounded; we use `1 / (1 + d)` so higher = more
 * relevant and the result stays finite. This is monotonic with distance
 * and preserves ordering, which is all the re-ranker needs.
 */
export function distanceToSimilarity(distance: number): number {
  if (!Number.isFinite(distance) || distance < 0) return 0;
  return 1 / (1 + distance);
}

export interface SearchOptions {
  /** How many candidates to ask sqlite-vec for before re-ranking. */
  limit?: number;
}

/**
 * Execute the vec0 MATCH query and hydrate results. Throws
 * AmicusError.EXTENSION_NOT_LOADED if sqlite-vec isn't on the connection.
 */
export async function searchByVector(
  vector: number[],
  opts: SearchOptions = {},
): Promise<RetrievedChunk[]> {
  const limit = opts.limit ?? 40;
  const db = getDb();
  const blob = packVector(vector);

  let rows: VectorSearchRow[];
  try {
    rows = await db.getAllAsync<VectorSearchRow>(
      `SELECT
         m.chunk_id        AS chunk_id,
         m.source_type     AS source_type,
         m.source_id       AS source_id,
         t.text            AS text,
         e.distance        AS distance,
         m.scholar_id      AS scholar_id,
         m.tradition       AS tradition,
         m.book_id         AS book_id,
         m.chapter_num     AS chapter_num,
         m.verse_start     AS verse_start,
         m.verse_end       AS verse_end,
         m.panel_type      AS panel_type
       FROM embeddings e
       JOIN chunk_text t      ON t.rowid = e.rowid
       JOIN chunk_metadata m  ON m.rowid = e.rowid
       WHERE e.embedding MATCH ?
       ORDER BY e.distance
       LIMIT ?`,
      [blob, limit],
    );
  } catch (err) {
    const msg = (err as Error).message ?? '';
    if (msg.includes('vec0') || msg.includes('no such module') || msg.includes('embeddings')) {
      logger.error('Amicus', 'sqlite-vec not loaded on scripture.db', err);
      throw new AmicusError('EXTENSION_NOT_LOADED', msg);
    }
    throw err;
  }

  return rows.map((r) => ({
    chunk_id: r.chunk_id,
    source_type: r.source_type,
    source_id: r.source_id,
    text: r.text,
    score: distanceToSimilarity(r.distance),
    metadata: {
      scholar_id: r.scholar_id ?? undefined,
      tradition: r.tradition ?? undefined,
      book_id: r.book_id ?? undefined,
      chapter_num: r.chapter_num ?? undefined,
      verse_start: r.verse_start ?? undefined,
      verse_end: r.verse_end ?? undefined,
      panel_type: r.panel_type ?? undefined,
    },
  }));
}
