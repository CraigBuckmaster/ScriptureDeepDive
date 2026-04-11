/**
 * Hook tests for usePersonJourney.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetPerson = jest.fn();
const mockGetPersonJourney = jest.fn();
const mockGetPersonLegacyRefs = jest.fn();

jest.mock('@/db/content', () => ({
  getPerson: (...args: any[]) => mockGetPerson(...args),
  getPersonJourney: (...args: any[]) => mockGetPersonJourney(...args),
  getPersonLegacyRefs: (...args: any[]) => mockGetPersonLegacyRefs(...args),
}));

import { usePersonJourney } from '@/hooks/usePersonJourney';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPerson.mockResolvedValue(null);
  mockGetPersonJourney.mockResolvedValue([]);
  mockGetPersonLegacyRefs.mockResolvedValue([]);
});

describe('usePersonJourney', () => {
  it('returns loading false quickly when personId is null', async () => {
    const { result } = renderHook(() => usePersonJourney(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.person).toBeNull();
    expect(result.current.stages).toEqual([]);
    expect(result.current.legacyRefs).toEqual([]);
  });

  it('loads person, stages, and legacy refs', async () => {
    const person = { id: 'abraham', name: 'Abraham' };
    const stages = [{ id: 's1', person_id: 'abraham', title: 'Call' }];
    const refs = [{ id: 'r1', person_id: 'abraham', verse_ref: 'gen 12:1' }];
    mockGetPerson.mockResolvedValue(person);
    mockGetPersonJourney.mockResolvedValue(stages);
    mockGetPersonLegacyRefs.mockResolvedValue(refs);

    const { result } = renderHook(() => usePersonJourney('abraham'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.person).toEqual(person);
    expect(result.current.stages).toEqual(stages);
    expect(result.current.legacyRefs).toEqual(refs);
  });

  it('handles person not found', async () => {
    mockGetPerson.mockResolvedValue(null);
    const { result } = renderHook(() => usePersonJourney('unknown'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.person).toBeNull();
  });
});
