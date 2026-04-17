/**
 * services/amicus/rerank.ts — Profile + context boosts and diversity filter.
 *
 * Pure functions so every step is unit-testable without a database.
 *
 * Pipeline (see plan §6):
 *   1. boost current chapter × 1.5
 *   2. boost preferred scholars × 1.1
 *   3. boost preferred traditions × 1.05
 *   4. diversify: max 2 chunks per scholar_id
 *   5. sort desc, return top 10
 */
import type { ChapterRef, CompressedProfile, RetrievedChunk } from './types';

export const CURRENT_CHAPTER_BOOST = 1.5;
export const SCHOLAR_BOOST = 1.1;
export const TRADITION_BOOST = 1.05;
export const SCHOLAR_DIVERSITY_CAP = 2;
export const RESULT_LIMIT = 10;

export function boostCurrentChapter(
  chunks: RetrievedChunk[],
  currentChapterRef: ChapterRef | null,
): RetrievedChunk[] {
  if (!currentChapterRef) return chunks;
  return chunks.map((c) => {
    const m = c.metadata;
    if (m.book_id === currentChapterRef.book_id && m.chapter_num === currentChapterRef.chapter_num) {
      return { ...c, score: c.score * CURRENT_CHAPTER_BOOST };
    }
    return c;
  });
}

export function boostPreferredScholars(
  chunks: RetrievedChunk[],
  preferred: string[],
): RetrievedChunk[] {
  if (preferred.length === 0) return chunks;
  const set = new Set(preferred);
  return chunks.map((c) => {
    const sid = c.metadata.scholar_id;
    return sid && set.has(sid) ? { ...c, score: c.score * SCHOLAR_BOOST } : c;
  });
}

export function boostPreferredTraditions(
  chunks: RetrievedChunk[],
  preferred: string[],
): RetrievedChunk[] {
  if (preferred.length === 0) return chunks;
  const set = new Set(preferred);
  return chunks.map((c) => {
    const t = c.metadata.tradition;
    return t && set.has(t) ? { ...c, score: c.score * TRADITION_BOOST } : c;
  });
}

/**
 * Cap the number of chunks per scholar_id. Walks the already-sorted list
 * and drops chunks beyond the cap so the most relevant ones are kept.
 */
export function diversifyByScholar(
  chunks: RetrievedChunk[],
  cap: number = SCHOLAR_DIVERSITY_CAP,
): RetrievedChunk[] {
  const seen = new Map<string, number>();
  const out: RetrievedChunk[] = [];
  for (const c of chunks) {
    const sid = c.metadata.scholar_id;
    if (!sid) {
      out.push(c);
      continue;
    }
    const n = seen.get(sid) ?? 0;
    if (n >= cap) continue;
    seen.set(sid, n + 1);
    out.push(c);
  }
  return out;
}

/**
 * End-to-end rerank: apply all boosts, sort by score desc, diversify,
 * and return the top RESULT_LIMIT.
 */
export function rerank(
  chunks: RetrievedChunk[],
  profile: CompressedProfile,
  currentChapterRef: ChapterRef | null,
): RetrievedChunk[] {
  const step1 = boostCurrentChapter(chunks, currentChapterRef);
  const step2 = boostPreferredScholars(step1, profile.preferred_scholars);
  const step3 = boostPreferredTraditions(step2, profile.preferred_traditions);
  const sorted = [...step3].sort((a, b) => b.score - a.score);
  const diversified = diversifyByScholar(sorted);
  return diversified.slice(0, RESULT_LIMIT);
}
