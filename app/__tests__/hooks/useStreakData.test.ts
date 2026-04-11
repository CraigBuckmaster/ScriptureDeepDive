import { renderHook, waitFor, act } from '@testing-library/react-native';

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

  it('formats multi-word book IDs correctly', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 10,
      currentStreak: 1,
      longestStreak: 1,
      favouriteBook: '1_samuel',
    });

    mockGetAllAsync.mockResolvedValue([
      { book_id: '1_samuel', chapters: 2 },
    ]);

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.weeklyChapters).toBe(2);
    });
    expect(result.current.weeklyBookNames).toEqual(['1 Samuel']);
  });

  it('shows chapter milestone when threshold reached', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 12,
      currentStreak: 2,
      longestStreak: 5,
      favouriteBook: 'genesis',
    });
    mockGetAllAsync.mockResolvedValue([]);
    mockGetPreference.mockResolvedValue(null); // no seen milestones

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.pendingMilestone).toBeTruthy();
    });
    expect(result.current.pendingMilestone).toContain('10 chapters');
  });

  it('shows streak milestone when threshold reached', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 3,
      currentStreak: 7,
      longestStreak: 7,
      favouriteBook: 'genesis',
    });
    mockGetAllAsync.mockResolvedValue([]);
    mockGetPreference.mockResolvedValue(null);

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.pendingMilestone).toBeTruthy();
    });
    expect(result.current.pendingMilestone).toContain('Seven days');
  });

  it('does not show already-seen milestones', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 12,
      currentStreak: 2,
      longestStreak: 5,
      favouriteBook: 'genesis',
    });
    mockGetAllAsync.mockResolvedValue([]);
    mockGetPreference.mockResolvedValue('["ch_10"]'); // ch_10 already seen

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      // Should have loaded
      expect(mockGetReadingStats).toHaveBeenCalled();
    });
    // No pending milestone since ch_10 is seen and threshold for ch_50 (50) not met
    expect(result.current.pendingMilestone).toBeNull();
  });

  it('markMilestoneSeen persists and clears milestone', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 12,
      currentStreak: 2,
      longestStreak: 5,
      favouriteBook: 'genesis',
    });
    mockGetAllAsync.mockResolvedValue([]);
    mockGetPreference.mockResolvedValue(null);
    mockSetPreference.mockResolvedValue(undefined);

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => {
      expect(result.current.pendingMilestone).toBeTruthy();
    });

    await act(async () => {
      await result.current.markMilestoneSeen();
    });

    expect(mockSetPreference).toHaveBeenCalledWith(
      'seen_milestones',
      expect.stringContaining('ch_10'),
    );
    expect(result.current.pendingMilestone).toBeNull();
  });

  it('markMilestoneSeen is no-op when no pending milestone', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 2,
      currentStreak: 1,
      longestStreak: 1,
      favouriteBook: null,
    });
    mockGetAllAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useStreakData());
    await waitFor(() => expect(mockGetReadingStats).toHaveBeenCalled());

    await act(async () => {
      await result.current.markMilestoneSeen();
    });

    expect(mockSetPreference).not.toHaveBeenCalled();
  });
});
