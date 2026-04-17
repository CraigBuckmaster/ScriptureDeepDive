/**
 * Tests for rerank pipeline.
 *
 * Pure-compute, no DB, no network.
 */
import {
  CURRENT_CHAPTER_BOOST,
  RESULT_LIMIT,
  SCHOLAR_BOOST,
  SCHOLAR_DIVERSITY_CAP,
  TRADITION_BOOST,
  boostCurrentChapter,
  boostPreferredScholars,
  boostPreferredTraditions,
  diversifyByScholar,
  rerank,
} from '../rerank';
import type { CompressedProfile, RetrievedChunk } from '../types';

function chunk(
  chunk_id: string,
  score: number,
  metadata: RetrievedChunk['metadata'] = {},
): RetrievedChunk {
  return {
    chunk_id,
    source_type: 'section_panel',
    source_id: chunk_id.split(':')[1] ?? chunk_id,
    text: `text for ${chunk_id}`,
    score,
    metadata,
  };
}

const BASIC_PROFILE: CompressedProfile = {
  prose: 'Test profile',
  preferred_scholars: [],
  preferred_traditions: [],
};

describe('boostCurrentChapter', () => {
  it('multiplies only chunks on the current chapter', () => {
    const chunks = [
      chunk('a', 1.0, { book_id: 'romans', chapter_num: 9 }),
      chunk('b', 1.0, { book_id: 'romans', chapter_num: 10 }),
      chunk('c', 1.0, { book_id: 'genesis', chapter_num: 1 }),
    ];
    const ref = { book_id: 'romans', chapter_num: 9 };
    const boosted = boostCurrentChapter(chunks, ref);
    expect(boosted[0]!.score).toBeCloseTo(CURRENT_CHAPTER_BOOST);
    expect(boosted[1]!.score).toBe(1.0);
    expect(boosted[2]!.score).toBe(1.0);
  });

  it('is a no-op when currentChapterRef is null', () => {
    const c = [chunk('a', 0.5)];
    expect(boostCurrentChapter(c, null)).toEqual(c);
  });
});

describe('boostPreferredScholars', () => {
  it('multiplies matching scholars and leaves others unchanged', () => {
    const chunks = [
      chunk('a', 1.0, { scholar_id: 'calvin' }),
      chunk('b', 1.0, { scholar_id: 'sarna' }),
      chunk('c', 1.0),
    ];
    const out = boostPreferredScholars(chunks, ['calvin']);
    expect(out[0]!.score).toBeCloseTo(SCHOLAR_BOOST);
    expect(out[1]!.score).toBe(1.0);
    expect(out[2]!.score).toBe(1.0);
  });

  it('is a no-op when preferred list is empty', () => {
    const c = [chunk('a', 0.5, { scholar_id: 'calvin' })];
    expect(boostPreferredScholars(c, [])).toEqual(c);
  });
});

describe('boostPreferredTraditions', () => {
  it('multiplies matching traditions', () => {
    const chunks = [
      chunk('a', 1.0, { tradition: 'Reformed' }),
      chunk('b', 1.0, { tradition: 'Jewish' }),
    ];
    const out = boostPreferredTraditions(chunks, ['Reformed']);
    expect(out[0]!.score).toBeCloseTo(TRADITION_BOOST);
    expect(out[1]!.score).toBe(1.0);
  });
});

describe('diversifyByScholar', () => {
  it('caps to 2 chunks per scholar by default', () => {
    const chunks = [
      chunk('1', 0.9, { scholar_id: 'calvin' }),
      chunk('2', 0.8, { scholar_id: 'calvin' }),
      chunk('3', 0.7, { scholar_id: 'calvin' }),
      chunk('4', 0.6, { scholar_id: 'sarna' }),
    ];
    const out = diversifyByScholar(chunks);
    const calvins = out.filter((c) => c.metadata.scholar_id === 'calvin');
    expect(calvins).toHaveLength(SCHOLAR_DIVERSITY_CAP);
    expect(out.map((c) => c.chunk_id)).toEqual(['1', '2', '4']);
  });

  it('passes through chunks without scholar_id', () => {
    const chunks = [chunk('1', 0.9), chunk('2', 0.8), chunk('3', 0.7)];
    expect(diversifyByScholar(chunks)).toEqual(chunks);
  });
});

describe('rerank (end-to-end)', () => {
  const profile: CompressedProfile = {
    prose: 'p',
    preferred_scholars: ['calvin'],
    preferred_traditions: ['Reformed'],
  };

  it('applies boosts, diversifies, and caps at RESULT_LIMIT', () => {
    const chunks: RetrievedChunk[] = [];
    for (let i = 0; i < 15; i++) {
      chunks.push(chunk(`${i}`, 0.5, { scholar_id: 'calvin' }));
    }
    const out = rerank(chunks, profile, null);
    expect(out.length).toBeLessThanOrEqual(RESULT_LIMIT);
    // Calvin cap of 2 still holds.
    const calvins = out.filter((c) => c.metadata.scholar_id === 'calvin');
    expect(calvins.length).toBeLessThanOrEqual(SCHOLAR_DIVERSITY_CAP);
  });

  it('does not invert score ordering with boosts', () => {
    // a starts well ahead; boost to b shouldn't flip the order unless b is
    // also close to a to begin with.
    const chunks = [
      chunk('a', 1.0),
      chunk('b', 0.3, { scholar_id: 'calvin' }), // +10% = 0.33
    ];
    const out = rerank(chunks, profile, null);
    expect(out[0]!.chunk_id).toBe('a');
    expect(out[1]!.chunk_id).toBe('b');
  });

  it('sorts by score descending', () => {
    const chunks = [chunk('lo', 0.3), chunk('hi', 0.9), chunk('mid', 0.6)];
    const out = rerank(chunks, BASIC_PROFILE, null);
    expect(out.map((c) => c.chunk_id)).toEqual(['hi', 'mid', 'lo']);
  });
});
