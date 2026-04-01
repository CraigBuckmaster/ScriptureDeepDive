import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAllWordStudies = jest.fn();

jest.mock('@/db/content', () => ({
  getAllWordStudies: (...args: any[]) => mockGetAllWordStudies(...args),
}));

import { useWordStudies } from '@/hooks/useWordStudies';

describe('useWordStudies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state', () => {
    mockGetAllWordStudies.mockResolvedValue([]);
    const { result } = renderHook(() => useWordStudies());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns word studies list after loading', async () => {
    const mockStudies = [
      { id: 'hesed', word: 'Hesed', language: 'hebrew' },
      { id: 'agape', word: 'Agape', language: 'greek' },
    ];
    mockGetAllWordStudies.mockResolvedValue(mockStudies);

    const { result } = renderHook(() => useWordStudies());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.studies).toEqual(mockStudies);
  });

  it('sets isLoading to false after data loads', async () => {
    mockGetAllWordStudies.mockResolvedValue([]);
    const { result } = renderHook(() => useWordStudies());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.studies).toEqual([]);
  });

  it('calls getAllWordStudies on mount', async () => {
    mockGetAllWordStudies.mockResolvedValue([]);
    renderHook(() => useWordStudies());

    await waitFor(() => {
      expect(mockGetAllWordStudies).toHaveBeenCalledTimes(1);
    });
  });
});
