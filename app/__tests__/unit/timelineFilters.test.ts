/**
 * Unit tests for pure helpers exported from TimelineScreen.
 * These live in the screen file because they're small and purely
 * transformational — no point extracting them into their own module.
 */

// Mock @/stores because importing the screen transitively needs it.
jest.mock('@/stores', () => ({
  useSettingsStore: Object.assign(
    (sel: any) => sel({ translation: 'kjv', fontSize: 16 }),
    { getState: () => ({ markGettingStartedDone: jest.fn() }) },
  ),
  useReaderStore: (sel: any) => sel({}),
}));

jest.mock('@/db/content', () => ({
  getAllTimelineEntries: jest.fn().mockResolvedValue([]),
  getEras: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/hooks/useContentImages', () => ({
  useContentImages: jest.fn().mockReturnValue({ images: [], isLoading: false }),
}));

import {
  computeEraCounts,
  filterTimeline,
  eventMatchesPerson,
} from '@/screens/TimelineScreen';
import type { TimelineEntry } from '@/types';

function entry(overrides: Partial<TimelineEntry>): TimelineEntry {
  const base: TimelineEntry = {
    id: 'id',
    name: 'Name',
    category: 'event',
    era: 'primeval',
    year: -1000,
    summary: null,
    scripture_ref: null,
    chapter_link: null,
    people_json: null,
    region: null,
  };
  return { ...base, ...overrides };
}

describe('computeEraCounts', () => {
  it('returns {} for null/undefined/empty', () => {
    expect(computeEraCounts(null)).toEqual({});
    expect(computeEraCounts(undefined)).toEqual({});
    expect(computeEraCounts([])).toEqual({});
  });

  it('counts each event by era', () => {
    const result = computeEraCounts([
      entry({ id: 'a', era: 'primeval' }),
      entry({ id: 'b', era: 'primeval' }),
      entry({ id: 'c', era: 'patriarchs' }),
    ]);
    expect(result).toEqual({ primeval: 2, patriarchs: 1 });
  });

  it('skips entries without an era', () => {
    const result = computeEraCounts([
      entry({ id: 'a', era: null }),
      entry({ id: 'b', era: 'exodus' }),
    ]);
    expect(result).toEqual({ exodus: 1 });
  });
});

describe('filterTimeline', () => {
  // 'book' isn't in TimelineEntry.category union (it comes from other DB tables
  // via unions), but the filter logic still honours it — hence the `as any`.
  const ENTRIES = [
    entry({ id: 'a', category: 'event', era: 'primeval' }),
    entry({ id: 'b', category: 'book' as any, era: 'primeval' }),
    entry({ id: 'c', category: 'person', era: 'patriarchs' }),
    entry({ id: 'd', category: 'world', era: 'patriarchs' }),
  ];

  it('includes all categories by default', () => {
    const out = filterTimeline(ENTRIES, {
      event: true, book: true, person: true, world: true,
    }, null);
    expect(out).toHaveLength(4);
  });

  it('drops categories whose filter is off', () => {
    const out = filterTimeline(ENTRIES, {
      event: true, book: false, person: false, world: false,
    }, null);
    expect(out.map((e) => e.id)).toEqual(['a']);
  });

  it('falls back to event+book when all categories are off', () => {
    const out = filterTimeline(ENTRIES, {
      event: false, book: false, person: false, world: false,
    }, null);
    expect(out.map((e) => e.id).sort()).toEqual(['a', 'b']);
  });

  it('filters by era when an eraId is supplied', () => {
    const out = filterTimeline(ENTRIES, {
      event: true, book: true, person: true, world: true,
    }, 'patriarchs');
    expect(out.map((e) => e.id).sort()).toEqual(['c', 'd']);
  });

  it('returns [] for nullish input', () => {
    expect(
      filterTimeline(null, { event: true, book: true, person: true, world: true }, null),
    ).toEqual([]);
  });
});

describe('eventMatchesPerson', () => {
  it('returns false for null/empty person id', () => {
    const e = entry({ people_json: '["abraham"]' });
    expect(eventMatchesPerson(e, null)).toBe(false);
    expect(eventMatchesPerson(e, '')).toBe(false);
  });

  it('returns false for events without people_json', () => {
    const e = entry({ people_json: null });
    expect(eventMatchesPerson(e, 'abraham')).toBe(false);
  });

  it('returns false for malformed people_json', () => {
    const e = entry({ people_json: 'not-json' });
    expect(eventMatchesPerson(e, 'abraham')).toBe(false);
  });

  it('returns true when the person id is in the array', () => {
    const e = entry({ people_json: '["sarah","abraham"]' });
    expect(eventMatchesPerson(e, 'abraham')).toBe(true);
  });

  it('returns false when the person id is not in the array', () => {
    const e = entry({ people_json: '["sarah"]' });
    expect(eventMatchesPerson(e, 'abraham')).toBe(false);
  });
});
