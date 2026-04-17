/**
 * Tests for prose assembly templates.
 *
 * Pure function — no DB or network.
 */
import { MAX_PROSE_CHARS, assembleProfile } from '../templates';
import type { RawSignals } from '../types';

function signals(overrides: Partial<RawSignals> = {}): RawSignals {
  return {
    total_chapters_read: 0,
    last_30_day_chapters: 0,
    top_scholars_opened: [],
    tradition_distribution: {},
    genre_distribution: {},
    completed_journeys: [],
    active_journey: null,
    recent_chapters: [],
    current_focus: null,
    ...overrides,
  };
}

describe('assembleProfile', () => {
  it('produces a minimal prose for new users (thin profile)', () => {
    const out = assembleProfile(signals());
    expect(out.prose).toContain('New to Companion Study');
    expect(out.preferred_scholars).toEqual([]);
    expect(out.preferred_traditions).toEqual([]);
  });

  it('adds current-chapter clause for new users if they have one', () => {
    const out = assembleProfile(
      signals({
        total_chapters_read: 0,
        recent_chapters: [
          { book_id: 'genesis', chapter_num: 3, last_visit: new Date().toISOString() },
        ],
      }),
    );
    expect(out.prose).toMatch(/Genesis 3/);
  });

  it('builds a full thick profile with boosts', () => {
    const recent = new Date().toISOString();
    const out = assembleProfile(
      signals({
        total_chapters_read: 123,
        current_focus: { book_id: 'romans', chapters_in_range: 7, days_in_range: 14 },
        top_scholars_opened: [
          { scholar_id: 'calvin', open_count: 40 },
          { scholar_id: 'sarna', open_count: 18 },
          { scholar_id: 'wright', open_count: 5 }, // below threshold
        ],
        tradition_distribution: { Reformed: 0.55, Jewish: 0.25 },
        completed_journeys: ['garden_to_city'],
        active_journey: 'holy_week',
        recent_chapters: [
          { book_id: 'romans', chapter_num: 9, last_visit: recent },
        ],
      }),
    );
    expect(out.prose).toMatch(/123 chapters total/);
    expect(out.prose).toMatch(/Romans/);
    expect(out.prose).toMatch(/Calvin and Sarna/);
    expect(out.prose).toMatch(/Reformed/);
    expect(out.prose).toMatch(/Holy Week/);
    expect(out.preferred_scholars).toEqual(['calvin', 'sarna']);
    expect(out.preferred_traditions).toEqual(['Reformed']);
  });

  it('omits tradition clause when no tradition clears 30%', () => {
    const out = assembleProfile(
      signals({
        total_chapters_read: 10,
        tradition_distribution: { Reformed: 0.2, Jewish: 0.2, Evangelical: 0.2 },
      }),
    );
    expect(out.prose).not.toMatch(/perspectives/);
    expect(out.preferred_traditions).toEqual([]);
  });

  it('truncates oversized input', () => {
    const bigCompleted = Array.from({ length: 50 }, (_, i) => `journey_${i}`);
    const out = assembleProfile(
      signals({
        total_chapters_read: 9999,
        completed_journeys: bigCompleted,
        active_journey: 'x'.repeat(400),
      }),
    );
    expect(out.prose.length).toBeLessThanOrEqual(MAX_PROSE_CHARS);
  });

  it('omits current-reading when last visit is older than 24h', () => {
    const stale = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const out = assembleProfile(
      signals({
        total_chapters_read: 5,
        recent_chapters: [{ book_id: 'john', chapter_num: 1, last_visit: stale }],
      }),
    );
    expect(out.prose).not.toMatch(/Currently reading/);
  });
});
