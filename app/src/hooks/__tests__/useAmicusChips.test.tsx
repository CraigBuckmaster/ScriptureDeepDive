/**
 * Unit tests for the pure helpers of useAmicusChips. Hook-level effect
 * behavior is simpler than the DB plumbing it wraps, so we focus on the
 * deterministic parts (variant fallback order + context key mapping).
 */
import { _internal } from '@/hooks/useAmicusChips';

describe('variantLookupOrder', () => {
  it('prefers caller-supplied variant, falls back to generic_balanced then default', () => {
    expect(_internal.variantLookupOrder('reformed_narrative')).toEqual([
      'reformed_narrative',
      'generic_balanced',
      'default',
    ]);
  });

  it('omits duplicates when caller passes the default variant', () => {
    expect(_internal.variantLookupOrder('generic_balanced')).toEqual([
      'generic_balanced',
      'default',
    ]);
  });

  it('returns just the fallbacks when no variant is provided', () => {
    expect(_internal.variantLookupOrder()).toEqual(['generic_balanced', 'default']);
  });
});

describe('entityKeyFromContext', () => {
  it('builds chapter keys as `${bookId}-${chapterNum}`', () => {
    expect(_internal.entityKeyFromContext({
      kind: 'chapter', bookId: 'romans', chapterNum: 9,
    })).toEqual({ entityType: 'chapter', entityId: 'romans-9' });
  });

  it('maps person / place / debate contexts one-to-one', () => {
    expect(_internal.entityKeyFromContext({ kind: 'person', personId: 'abraham' }))
      .toEqual({ entityType: 'person', entityId: 'abraham' });
    expect(_internal.entityKeyFromContext({ kind: 'place', placeId: 'jerusalem' }))
      .toEqual({ entityType: 'place', entityId: 'jerusalem' });
    expect(_internal.entityKeyFromContext({ kind: 'debate_topic', topicId: 'yom' }))
      .toEqual({ entityType: 'debate_topic', entityId: 'yom' });
  });

  it('returns null for none', () => {
    expect(_internal.entityKeyFromContext({ kind: 'none' })).toBeNull();
  });
});
