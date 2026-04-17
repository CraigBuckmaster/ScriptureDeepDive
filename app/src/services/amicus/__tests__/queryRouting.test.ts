/**
 * Tests for services/amicus/queryRouting.ts — inert scaffold for the
 * Apple Foundation Models deferral (#1473).
 */
import {
  classifyQuery,
  pickRoute,
  resolveRoute,
  SIMPLE_MAX_CHUNKS,
  SIMPLE_MAX_QUERY_CHARS,
} from '@/services/amicus/queryRouting';

describe('classifyQuery', () => {
  it('returns simple for a short, single-chunk, first-turn query', () => {
    expect(
      classifyQuery({
        query: 'What is hesed?',
        retrievedChunkCount: 1,
        conversationHistoryLength: 0,
      }),
    ).toBe('simple');
  });

  it('returns complex when the chunk count exceeds the cap', () => {
    expect(
      classifyQuery({
        query: 'q',
        retrievedChunkCount: SIMPLE_MAX_CHUNKS + 1,
        conversationHistoryLength: 0,
      }),
    ).toBe('complex');
  });

  it('accepts chunk count exactly at the cap as simple', () => {
    expect(
      classifyQuery({
        query: 'q',
        retrievedChunkCount: SIMPLE_MAX_CHUNKS,
        conversationHistoryLength: 0,
      }),
    ).toBe('simple');
  });

  it('returns complex whenever conversation history is non-empty', () => {
    expect(
      classifyQuery({
        query: 'q',
        retrievedChunkCount: 1,
        conversationHistoryLength: 1,
      }),
    ).toBe('complex');
  });

  it('returns complex when the query is long', () => {
    expect(
      classifyQuery({
        query: 'x'.repeat(SIMPLE_MAX_QUERY_CHARS),
        retrievedChunkCount: 1,
        conversationHistoryLength: 0,
      }),
    ).toBe('complex');
  });

  it('ignores whitespace when measuring length', () => {
    expect(
      classifyQuery({
        query: '  short query  ',
        retrievedChunkCount: 1,
        conversationHistoryLength: 0,
      }),
    ).toBe('simple');
  });
});

describe('pickRoute', () => {
  it('returns cloud for complex queries regardless of runtime', () => {
    expect(
      pickRoute({ complexity: 'complex', appleFmAvailable: true }),
    ).toBe('cloud');
    expect(
      pickRoute({ complexity: 'complex', appleFmAvailable: false }),
    ).toBe('cloud');
  });

  it('returns cloud for simple queries when Apple FM is not available (today\'s default)', () => {
    expect(pickRoute({ complexity: 'simple' })).toBe('cloud');
    expect(
      pickRoute({ complexity: 'simple', appleFmAvailable: false }),
    ).toBe('cloud');
  });

  it('returns apple_fm for simple queries only once the capability flips on', () => {
    // This is the branch the deferred follow-up PR will hit. Today no
    // production call site passes `appleFmAvailable: true` — the test
    // exists to freeze the contract.
    expect(
      pickRoute({ complexity: 'simple', appleFmAvailable: true }),
    ).toBe('apple_fm');
  });
});

describe('resolveRoute', () => {
  it('always routes to cloud today', () => {
    const cases = [
      { query: 'What is hesed?', retrievedChunkCount: 1, conversationHistoryLength: 0 },
      { query: 'complex multi turn', retrievedChunkCount: 5, conversationHistoryLength: 3 },
      { query: 'x'.repeat(500), retrievedChunkCount: 1, conversationHistoryLength: 0 },
    ];
    for (const c of cases) {
      expect(resolveRoute(c)).toBe('cloud');
    }
  });
});
