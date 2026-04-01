import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: mockGetAllAsync,
    getFirstAsync: mockGetFirstAsync,
  }),
}));

const mockGetReadingStats = jest.fn();
const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();

jest.mock('@/db/user', () => ({
  getReadingStats: (...args: any[]) => mockGetReadingStats(...args),
  getPreference: (...args: any[]) => mockGetPreference(...args),
  setPreference: (...args: any[]) => mockSetPreference(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useStreakData } from '@/hooks/useStreakData';

describe('useStreakData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 0,
      currentStreak: 0,
      longestStreak: 0,
      favouriteBook: null,
    });
    mockGetAllAsync.mockResolvedValue([]);
    mockGetPreference.mockResolvedValue(null);
  });

  it('returns current streak from reading stats', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 25,
      currentStreak: 5,
      longestStreak: 10,
      favouriteBook: 'genesis',
    });

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.currentStreak).toBe(5);
    });

    expect(result.current.totalChapters).toBe(25);
  });

  it('returns zero streak when no reading history', async () => {
    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      // Wait for the hook to finish loading
      expect(mockGetReadingStats).toHaveBeenCalled();
    });

    expect(result.current.currentStreak).toBe(0);
    expect(result.current.totalChapters).toBe(0);
  });

  it('computes weekly chapters from reading_progress', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 50,
      currentStreak: 3,
      longestStreak: 7,
      favouriteBook: 'psalms',
    });

    mockGetAllAsync.mockResolvedValue([
      { book_id: 'genesis', chapters: 3 },
      { book_id: 'exodus', chapters: 2 },
    ]);

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.weeklyChapters).toBe(5);
    });

    expect(result.current.weeklyBookNames).toEqual(['Genesis', 'Exodus']);
  });
});
