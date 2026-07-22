/**
 * semanticVerses.test.ts — Semantic verse lane + RRF merge (#1876).
 *
 * embedQuery / searchByVector / getVerse are mocked; the tests exercise
 * the composition (embed → vector → hydration), dedupe/cap behavior, RRF
 * merge ordering, and error propagation for the FTS-only fallback.
 */

const mockEmbedQuery = jest.fn();
const mockSearchByVector = jest.fn();
const mockGetVerse = jest.fn();

jest.mock('@/services/amicus/embed', () => ({
  embedQuery: (...args: unknown[]) => mockEmbedQuery(...args),
}));
jest.mock('@/services/amicus/vectorSearch', () => ({
  searchByVector: (...args: unknown[]) => mockSearchByVector(...args),
}));
jest.mock('@/db/content', () => ({
  getVerse: (...args: unknown[]) => mockGetVerse(...args),
}));
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  searchVersesSemantic,
  mergeVersesRRF,
  RRF_K,
  _internal,
} from '@/services/search/semanticVerses';
import { AmicusError } from '@/services/amicus/types';
import type { Verse } from '@/types';

// ── Fixtures ───────────────────────────────────────────────────────

const VECTOR = Array.from({ length: 1536 }, () => 0.01);

function chunk(bookId: string | undefined, ch: number | undefined, vs: number | undefined, id = 'c1') {
  return {
    chunk_id: id,
    source_type: 'section_panel',
    source_id: 's1',
    text: 'chunk text',
    score: 0.9,
    metadata: { book_id: bookId, chapter_num: ch, verse_start: vs },
  };
}

function verse(bookId: string, ch: number, v: number): Verse {
  return {
    id: ch * 1000 + v,
    book_id: bookId,
    chapter_num: ch,
    verse_num: v,
    translation: 'kjv',
    text: `${bookId} ${ch}:${v} text`,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockEmbedQuery.mockResolvedValue(VECTOR);
  mockGetVerse.mockImplementation((bookId: string, ch: number, v: number) =>
    Promise.resolve(verse(bookId, ch, v)),
  );
});

// ── searchVersesSemantic ───────────────────────────────────────────

describe('searchVersesSemantic', () => {
  it('composes embed → vector search → verse hydration', async () => {
    mockSearchByVector.mockResolvedValue([
      chunk('genesis', 1, 3, 'a'),
      chunk('john', 1, 1, 'b'),
    ]);

    const result = await searchVersesSemantic('light and creation', 'token-123');

    expect(mockEmbedQuery).toHaveBeenCalledWith(
      'light and creation',
      expect.objectContaining({ authToken: 'token-123' }),
    );
    expect(mockSearchByVector).toHaveBeenCalledWith(VECTOR, { limit: _internal.CHUNK_LIMIT });
    expect(mockGetVerse).toHaveBeenCalledWith('genesis', 1, 3);
    expect(mockGetVerse).toHaveBeenCalledWith('john', 1, 1);
    // Vector-rank order preserved
    expect(result.map((v) => `${v.book_id} ${v.chapter_num}:${v.verse_num}`)).toEqual([
      'genesis 1:3',
      'john 1:1',
    ]);
  });

  it('dedupes chunks anchored to the same verse ref', async () => {
    mockSearchByVector.mockResolvedValue([
      chunk('genesis', 1, 3, 'a'),
      chunk('genesis', 1, 3, 'b'), // different chunk, same anchor
      chunk('psalms', 23, 1, 'c'),
    ]);

    const result = await searchVersesSemantic('shepherd', 't');
    expect(result).toHaveLength(2);
    expect(mockGetVerse).toHaveBeenCalledTimes(2);
  });

  it('skips chunks without a complete verse anchor', async () => {
    mockSearchByVector.mockResolvedValue([
      chunk(undefined, undefined, undefined, 'meta'), // e.g. meta_faq chunk
      chunk('romans', 8, undefined, 'partial'),
      chunk('romans', 8, 28, 'ok'),
    ]);

    const result = await searchVersesSemantic('hope', 't');
    expect(result).toHaveLength(1);
    expect(result[0].book_id).toBe('romans');
  });

  it('caps results at MAX_RESULTS', async () => {
    mockSearchByVector.mockResolvedValue(
      Array.from({ length: _internal.CHUNK_LIMIT }, (_, i) =>
        chunk('psalms', 119, i + 1, `c${i}`),
      ),
    );

    const result = await searchVersesSemantic('law', 't');
    expect(result).toHaveLength(_internal.MAX_RESULTS);
  });

  it('drops anchors whose verse row does not hydrate', async () => {
    mockSearchByVector.mockResolvedValue([
      chunk('genesis', 1, 3, 'a'),
      chunk('genesis', 99, 1, 'stale'), // no such row
    ]);
    mockGetVerse.mockImplementation((bookId: string, ch: number, v: number) =>
      Promise.resolve(ch === 99 ? null : verse(bookId, ch, v)),
    );

    const result = await searchVersesSemantic('beginnings', 't');
    expect(result).toHaveLength(1);
  });

  it('propagates AmicusError from embed (caller owns the FTS fallback)', async () => {
    mockEmbedQuery.mockRejectedValue(new AmicusError('OFFLINE', 'network down'));
    await expect(searchVersesSemantic('grace', 't')).rejects.toBeInstanceOf(AmicusError);
    expect(mockSearchByVector).not.toHaveBeenCalled();
  });

  it('propagates AmicusError from vector search', async () => {
    mockSearchByVector.mockRejectedValue(new AmicusError('EXTENSION_NOT_LOADED', 'no vec0'));
    await expect(searchVersesSemantic('grace', 't')).rejects.toBeInstanceOf(AmicusError);
  });
});

// ── mergeVersesRRF ─────────────────────────────────────────────────

describe('mergeVersesRRF', () => {
  const g13 = verse('genesis', 1, 3);
  const j11 = verse('john', 1, 1);
  const p231 = verse('psalms', 23, 1);
  const r828 = verse('romans', 8, 28);

  it('a verse in both lanes outranks single-lane leaders', () => {
    // j11: FTS #2 + semantic #1 → 1/62 + 1/61
    // g13: FTS #1 only         → 1/61
    const merged = mergeVersesRRF([g13, j11], [j11, p231]);
    expect(merged[0]).toBe(j11);
    expect(merged[1]).toBe(g13); // 1/61 > 1/63 (p231 at semantic #2)
    expect(merged[2]).toBe(p231);
  });

  it('dedupes by ref, keeping the FTS row instance', () => {
    const j11Semantic = { ...j11, id: 999 }; // same ref, different instance
    const merged = mergeVersesRRF([j11], [j11Semantic]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe(j11);
  });

  it('uses k=60 (documented RRF constant)', () => {
    expect(RRF_K).toBe(60);
    // Sanity: with k=60, both-lanes rank (2,2) beats single-lane rank 1:
    // 2/(60+2) ≈ 0.0323 > 1/61 ≈ 0.0164
    const merged = mergeVersesRRF([g13, j11], [p231, j11]);
    expect(merged[0]).toBe(j11);
  });

  it('preserves FTS order among FTS-only results (stable ties)', () => {
    const merged = mergeVersesRRF([g13, j11, p231, r828], []);
    expect(merged).toEqual([g13, j11, p231, r828]);
  });

  it('handles empty lanes', () => {
    expect(mergeVersesRRF([], [])).toEqual([]);
    expect(mergeVersesRRF([g13], [])).toEqual([g13]);
    expect(mergeVersesRRF([], [j11])).toEqual([j11]);
  });

  it('ignores duplicate refs within a single lane', () => {
    const merged = mergeVersesRRF([g13, { ...g13 }], [j11, { ...j11 }]);
    expect(merged).toHaveLength(2);
  });
});
