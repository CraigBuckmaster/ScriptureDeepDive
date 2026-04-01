import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAllScholars = jest.fn();

jest.mock('@/db/content', () => ({
  getAllScholars: (...args: any[]) => mockGetAllScholars(...args),
}));

import { useScholars } from '@/hooks/useScholars';

describe('useScholars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state', () => {
    mockGetAllScholars.mockResolvedValue([]);
    const { result } = renderHook(() => useScholars());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns scholars list after loading', async () => {
    const mockData = [
      { id: 'wright', name: 'N.T. Wright', tradition: 'Anglican' },
      { id: 'brueggemann', name: 'Walter Brueggemann', tradition: 'UCC' },
    ];
    mockGetAllScholars.mockResolvedValue(mockData);

    const { result } = renderHook(() => useScholars());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.scholars).toEqual(mockData);
  });

  it('sets isLoading to false after data loads', async () => {
    mockGetAllScholars.mockResolvedValue([]);
    const { result } = renderHook(() => useScholars());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.scholars).toEqual([]);
  });

  it('calls getAllScholars on mount', async () => {
    mockGetAllScholars.mockResolvedValue([]);
    renderHook(() => useScholars());

    await waitFor(() => {
      expect(mockGetAllScholars).toHaveBeenCalledTimes(1);
    });
  });
});
