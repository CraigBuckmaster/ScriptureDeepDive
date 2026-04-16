/**
 * Tests for rewritten useJourneyBrowse hook (unified journeys table).
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

const mockGetAllJourneys = jest.fn();
jest.mock('@/db/content/features', () => ({
  getAllJourneys: (...args: unknown[]) => mockGetAllJourneys(...args),
}));

import { useJourneyBrowse } from '@/hooks/useJourneyBrowse';

const mockJourneys = [
  { id: 'abraham', journey_type: 'person', title: 'Abraham', subtitle: 'Father of the faithful', lens_id: 'biographical', depth: 'long', sort_order: 0, person_id: 'abraham', concept_id: null, era: 'patriarchs', tags: null, hero_image_url: null, description: '' },
  { id: 'covenant', journey_type: 'concept', title: 'Covenant', subtitle: null, lens_id: 'theological', depth: 'long', sort_order: 0, person_id: null, concept_id: 'covenant', era: null, tags: null, hero_image_url: null, description: '' },
  { id: 'garden-to-city', journey_type: 'thematic', title: 'From Garden to City', subtitle: 'Eden to New Jerusalem', lens_id: 'narrative', depth: 'long', sort_order: 1, person_id: null, concept_id: null, era: null, tags: null, hero_image_url: null, description: '' },
];

describe('useJourneyBrowse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllJourneys.mockResolvedValue(mockJourneys);
  });

  it('loads and categorizes journeys by type', async () => {
    const { result } = renderHook(() => useJourneyBrowse());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allJourneys).toHaveLength(3);
    expect(result.current.personJourneys).toHaveLength(1);
    expect(result.current.conceptJourneys).toHaveLength(1);
    expect(result.current.thematicJourneys).toHaveLength(1);
  });

  it('extracts unique lens IDs', async () => {
    const { result } = renderHook(() => useJourneyBrowse());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lensIds).toContain('biographical');
    expect(result.current.lensIds).toContain('theological');
    expect(result.current.lensIds).toContain('narrative');
  });

  it('returns empty state when no journeys', async () => {
    mockGetAllJourneys.mockResolvedValue([]);
    const { result } = renderHook(() => useJourneyBrowse());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.allJourneys).toEqual([]);
    expect(result.current.lensIds).toEqual([]);
  });
});
