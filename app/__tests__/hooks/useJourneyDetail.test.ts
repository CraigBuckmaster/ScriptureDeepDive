/**
 * Tests for useJourneyDetail hook.
 */

import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/database', () => ({
  getDb: () => ({
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

const mockGetJourney = jest.fn();
const mockGetJourneyStops = jest.fn();
const mockGetJourneyTags = jest.fn();

jest.mock('@/db/content/features', () => ({
  getJourney: (...args: unknown[]) => mockGetJourney(...args),
  getJourneyStops: (...args: unknown[]) => mockGetJourneyStops(...args),
  getJourneyTags: (...args: unknown[]) => mockGetJourneyTags(...args),
}));

import { useJourneyDetail } from '@/hooks/useJourneyDetail';

const mockJourney = {
  id: 'garden-to-city',
  journey_type: 'thematic',
  title: 'From Garden to City',
  subtitle: 'Eden lost, Eden restored',
  description: 'A journey through sacred space.',
  lens_id: 'narrative',
  depth: 'long',
  sort_order: 1,
  person_id: null,
  concept_id: null,
  era: null,
  tags: null,
  hero_image_url: null,
};

const mockStops = [
  { id: 1, journey_id: 'garden-to-city', stop_order: 1, stop_type: 'regular', label: 'The Garden', ref: 'Genesis 2:8', book_id: 'genesis', chapter_num: 2, development: 'Eden is a temple.', what_changes: 'Baseline.', bridge_to_next: 'Bridge text.', linked_journey_id: null, linked_journey_intro: null, verse_start: 8, verse_end: 15 },
  { id: 2, journey_id: 'garden-to-city', stop_order: 2, stop_type: 'regular', label: 'Exile', ref: 'Genesis 3:24', book_id: 'genesis', chapter_num: 3, development: 'Expelled.', what_changes: 'Lost.', bridge_to_next: null, linked_journey_id: null, linked_journey_intro: null, verse_start: 24, verse_end: 24 },
];

describe('useJourneyDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetJourney.mockResolvedValue(mockJourney);
    mockGetJourneyStops.mockResolvedValue(mockStops);
    mockGetJourneyTags.mockResolvedValue([]);
  });

  it('loads journey with stops and computes reading time', async () => {
    const { result } = renderHook(() => useJourneyDetail('garden-to-city'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.journey?.title).toBe('From Garden to City');
    expect(result.current.stops).toHaveLength(2);
    expect(result.current.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it('returns empty state for undefined journeyId', async () => {
    const { result } = renderHook(() => useJourneyDetail(undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.journey).toBeNull();
    expect(result.current.stops).toEqual([]);
  });

  it('resolves linked journey lookups', async () => {
    const stopsWithLinked = [
      ...mockStops,
      { id: 3, journey_id: 'garden-to-city', stop_order: 3, stop_type: 'linked_journey', linked_journey_id: 'abraham', linked_journey_intro: 'See Abraham', label: null, ref: null, book_id: null, chapter_num: null, development: null, what_changes: null, bridge_to_next: null, verse_start: null, verse_end: null },
    ];
    mockGetJourneyStops.mockResolvedValue(stopsWithLinked);
    mockGetJourney
      .mockResolvedValueOnce(mockJourney)
      .mockResolvedValueOnce({ id: 'abraham', title: 'Abraham' });

    const { result } = renderHook(() => useJourneyDetail('garden-to-city'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.linkedJourneyLookups.get('abraham')?.title).toBe('Abraham');
  });
});
