import { renderHook, waitFor } from '@testing-library/react-native';
import { useHomeData } from '@/hooks/useHomeData';

jest.mock('@/db/content', () => ({
  getContentStats: jest.fn().mockResolvedValue({
    liveBooks: 10,
    liveChapters: 100,
    scholarCount: 5,
    peopleCount: 50,
    timelineCount: 20,
    prophecyChainCount: 3,
    conceptCount: 8,
    difficultPassageCount: 4,
  }),
}));

jest.mock('@/db/user', () => ({
  getRecentChapters: jest.fn().mockResolvedValue([]),
  getReadingStats: jest.fn().mockResolvedValue({ totalChapters: 5, currentStreak: 0 }),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn(),
}));

describe('useHomeData', () => {
  it('returns a greeting', () => {
    const { result } = renderHook(() => useHomeData());
    expect(['Good Morning', 'Good Afternoon', 'Good Evening']).toContain(result.current.greeting);
  });

  it('returns a verse of the day', () => {
    const { result } = renderHook(() => useHomeData());
    expect(result.current.verse).toBeDefined();
    expect(result.current.verse.ref).toBeTruthy();
    expect(result.current.verse.text).toBeTruthy();
  });

  it('loads content stats', async () => {
    const { result } = renderHook(() => useHomeData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.liveBooks).toBe(10);
  });

  it('returns a daily encouragement as subtitle', async () => {
    const { result } = renderHook(() => useHomeData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.subtitle).toBeTruthy();
    expect(result.current.subtitle).not.toBe('Learn to read the Bible the way it was written');
  });
});
