/**
 * #1831 — plan template builders (services/study/planTemplates).
 * Items must be derived from content queries only, so every builder is
 * exercised against mocked content-DB rows.
 */
import type { JourneyStop } from '@/types';

const mockGetBook = jest.fn();
const mockGetJourneyStops = jest.fn();
const mockGetTopic = jest.fn();

jest.mock('@/db/content', () => ({
  getBook: (...args: unknown[]) => mockGetBook(...args),
}));

jest.mock('@/db/content/features', () => ({
  getJourneyStops: (...args: unknown[]) => mockGetJourneyStops(...args),
}));

jest.mock('@/db/content/reference', () => ({
  getTopic: (...args: unknown[]) => mockGetTopic(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  buildBookPlanItems,
  buildJourneyPlanItems,
  buildTopicPlanItems,
  parseChapterId,
} from '@/services/study';

function makeStop(overrides: Partial<JourneyStop>): JourneyStop {
  return {
    id: 1,
    journey_id: 'j1',
    stop_order: 1,
    stop_type: 'passage' as JourneyStop['stop_type'],
    label: null,
    ref: null,
    book_id: null,
    chapter_num: null,
    verse_start: null,
    verse_end: null,
    development: null,
    what_changes: null,
    linked_journey_id: null,
    linked_journey_intro: null,
    bridge_to_next: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseChapterId', () => {
  it('parses simple and multi-underscore chapter ids', () => {
    expect(parseChapterId('genesis_1')).toEqual({ bookId: 'genesis', chapterNum: 1 });
    expect(parseChapterId('1_samuel_16')).toEqual({ bookId: '1_samuel', chapterNum: 16 });
    expect(parseChapterId('song_of_solomon_4')).toEqual({
      bookId: 'song_of_solomon',
      chapterNum: 4,
    });
  });

  it('returns null on unrecognized input', () => {
    expect(parseChapterId('genesis')).toBeNull();
    expect(parseChapterId('')).toBeNull();
  });
});

describe('buildBookPlanItems', () => {
  it('emits one session item per chapter in order', async () => {
    mockGetBook.mockResolvedValue({ id: 'jonah', total_chapters: 4 });

    const items = await buildBookPlanItems('jonah');

    expect(mockGetBook).toHaveBeenCalledWith('jonah');
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ kind: 'session', ref: { bookId: 'jonah', chapterNum: 1 } });
    expect(items[3]).toEqual({ kind: 'session', ref: { bookId: 'jonah', chapterNum: 4 } });
  });

  it('returns [] for an unknown book', async () => {
    mockGetBook.mockResolvedValue(null);
    expect(await buildBookPlanItems('atlantis')).toEqual([]);
  });
});

describe('buildJourneyPlanItems', () => {
  it('emits session items for scripture-anchored stops, keeping stop order and verse anchors', async () => {
    mockGetJourneyStops.mockResolvedValue([
      makeStop({ id: 11, stop_order: 1, book_id: 'genesis', chapter_num: 9 }),
      makeStop({ id: 12, stop_order: 2, book_id: null, chapter_num: null }), // interlude
      makeStop({ id: 13, stop_order: 3, book_id: 'jeremiah', chapter_num: 31, verse_start: 31 }),
    ]);

    const items = await buildJourneyPlanItems('covenant');

    expect(mockGetJourneyStops).toHaveBeenCalledWith('covenant');
    expect(items).toEqual([
      { kind: 'session', ref: { bookId: 'genesis', chapterNum: 9, stopId: 11 } },
      {
        kind: 'session',
        ref: { bookId: 'jeremiah', chapterNum: 31, verseStart: 31, stopId: 13 },
      },
    ]);
  });

  it('returns [] for a journey with no stops', async () => {
    mockGetJourneyStops.mockResolvedValue([]);
    expect(await buildJourneyPlanItems('empty')).toEqual([]);
  });
});

describe('buildTopicPlanItems', () => {
  it('emits deduped session items from relevant_chapters_json in curated order', async () => {
    mockGetTopic.mockResolvedValue({
      id: 'covenant',
      relevant_chapters_json: JSON.stringify([
        'genesis_15',
        'exodus_19',
        'genesis_15', // duplicate — dropped
        'not-a-chapter', // unparseable — dropped
        '2_samuel_7',
      ]),
    });

    const items = await buildTopicPlanItems('covenant');

    expect(items).toEqual([
      { kind: 'session', ref: { bookId: 'genesis', chapterNum: 15 } },
      { kind: 'session', ref: { bookId: 'exodus', chapterNum: 19 } },
      { kind: 'session', ref: { bookId: '2_samuel', chapterNum: 7 } },
    ]);
  });

  it('returns [] for an unknown topic, a null chapter list, or bad JSON', async () => {
    mockGetTopic.mockResolvedValueOnce(null);
    expect(await buildTopicPlanItems('missing')).toEqual([]);

    mockGetTopic.mockResolvedValueOnce({ id: 't', relevant_chapters_json: null });
    expect(await buildTopicPlanItems('t')).toEqual([]);

    mockGetTopic.mockResolvedValueOnce({ id: 't', relevant_chapters_json: '{oops' });
    expect(await buildTopicPlanItems('t')).toEqual([]);
  });
});
