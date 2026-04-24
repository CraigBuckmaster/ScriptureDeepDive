import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockGetDue = jest.fn();
const mockGetAll = jest.fn();
const mockGetConcepts = jest.fn();
const mockComplete = jest.fn();

jest.mock('@/db/userQueries', () => ({
  getDueGuidedReviewItems: (...args: any[]) => mockGetDue(...args),
  getAllGuidedReviewItems: (...args: any[]) => mockGetAll(...args),
  getConceptEncounters: (...args: any[]) => mockGetConcepts(...args),
}));

jest.mock('@/db/userMutations', () => ({
  completeGuidedReviewItem: (...args: any[]) => mockComplete(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useReviewQueue } from '@/hooks/useReviewQueue';

describe('useReviewQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockComplete.mockResolvedValue(undefined);
  });

  it('loads due items, all items, and concepts on mount', async () => {
    const due = [{ id: 1, prompt: 'P1' } as any];
    const all = [{ id: 1 } as any, { id: 2 } as any];
    const concepts = [{ concept_id: 'creation' } as any];
    mockGetDue.mockResolvedValue(due);
    mockGetAll.mockResolvedValue(all);
    mockGetConcepts.mockResolvedValue(concepts);

    const { result } = renderHook(() => useReviewQueue());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.dueItems).toEqual(due);
    expect(result.current.allItems).toEqual(all);
    expect(result.current.concepts).toEqual(concepts);
  });

  it('completes an item and reloads the queue', async () => {
    mockGetDue.mockResolvedValue([{ id: 7 } as any]);
    mockGetAll.mockResolvedValue([]);
    mockGetConcepts.mockResolvedValue([]);

    const { result } = renderHook(() => useReviewQueue());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetDue.mockClear();
    mockGetAll.mockClear();
    mockGetConcepts.mockClear();
    mockGetDue.mockResolvedValue([]);
    mockGetAll.mockResolvedValue([]);
    mockGetConcepts.mockResolvedValue([]);

    await act(async () => {
      await result.current.completeItem(7);
    });

    expect(mockComplete).toHaveBeenCalledWith(7);
    // Reload fires all three queries again
    expect(mockGetDue).toHaveBeenCalled();
    expect(mockGetAll).toHaveBeenCalled();
    expect(mockGetConcepts).toHaveBeenCalled();
  });

  it('clears loading even if all three queries fail', async () => {
    mockGetDue.mockRejectedValue(new Error('boom'));
    mockGetAll.mockRejectedValue(new Error('boom'));
    mockGetConcepts.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useReviewQueue());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.dueItems).toEqual([]);
    expect(result.current.allItems).toEqual([]);
    expect(result.current.concepts).toEqual([]);
  });
});
