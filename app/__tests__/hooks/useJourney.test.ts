/**
 * Tests for useJourney hook.
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

const mockGetFirstAsync = jest.fn();
const mockGetAllAsync = jest.fn();

jest.mock('@/db/content/features', () => ({
  getJourney: (...args: unknown[]) => mockGetFirstAsync(...args),
  getJourneyStops: (...args: unknown[]) => mockGetAllAsync(...args),
  getJourneyTags: (...args: unknown[]) => mockGetAllAsync(...args),
}));

import { useJourney } from '@/hooks/useJourney';

describe('useJourney', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading initially then resolves', async () => {
    mockGetFirstAsync.mockResolvedValue({
      id: 'garden-to-city',
      journey_type: 'thematic',
      title: 'From Garden to City',
      subtitle: null,
      description: 'Test description',
      lens_id: 'narrative',
      depth: 'long',
      sort_order: 1,
      person_id: null,
      concept_id: null,
      era: null,
      tags: null,
      hero_image_url: null,
    });
    mockGetAllAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useJourney('garden-to-city'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.journey).not.toBeNull();
    expect(result.current.journey?.title).toBe('From Garden to City');
  });

  it('returns null journey for null id', async () => {
    const { result } = renderHook(() => useJourney(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.journey).toBeNull();
    expect(result.current.stops).toEqual([]);
  });

  it('loads stops alongside journey', async () => {
    mockGetFirstAsync.mockResolvedValue({ id: 'test', title: 'Test' });
    mockGetAllAsync
      .mockResolvedValueOnce([
        { id: 1, journey_id: 'test', stop_order: 1, label: 'Stop 1' },
        { id: 2, journey_id: 'test', stop_order: 2, label: 'Stop 2' },
      ])
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() => useJourney('test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stops).toHaveLength(2);
  });
});
