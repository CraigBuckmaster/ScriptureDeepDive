import { renderHook, act } from '@testing-library/react-native';

const mockIsAvailableAsync = jest.fn();
const mockRequestReview = jest.fn();

jest.mock('expo-store-review', () => ({
  isAvailableAsync: (...args: any[]) => mockIsAvailableAsync(...args),
  requestReview: (...args: any[]) => mockRequestReview(...args),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { version: '2.0.0' },
}));

const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();
const mockGetReadingStats = jest.fn();

jest.mock('@/db/user', () => ({
  getPreference: (...args: any[]) => mockGetPreference(...args),
  setPreference: (...args: any[]) => mockSetPreference(...args),
  getReadingStats: (...args: any[]) => mockGetReadingStats(...args),
}));

import { useStoreReview } from '@/hooks/useStoreReview';

describe('useStoreReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockIsAvailableAsync.mockResolvedValue(true);
    mockRequestReview.mockResolvedValue(undefined);
    mockGetReadingStats.mockResolvedValue({ totalChapters: 0 });
    mockGetPreference.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not prompt when fewer than 3 chapters read', async () => {
    mockGetReadingStats.mockResolvedValue({ totalChapters: 2 });

    const { result } = renderHook(() => useStoreReview());
    await act(async () => {
      await result.current.checkAndPrompt();
    });

    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('does not prompt when already prompted for this version', async () => {
    mockGetReadingStats.mockResolvedValue({ totalChapters: 10 });
    mockGetPreference.mockResolvedValue('2.0.0');

    const { result } = renderHook(() => useStoreReview());
    await act(async () => {
      await result.current.checkAndPrompt();
    });

    jest.advanceTimersByTime(3000);
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('prompts for review when conditions are met', async () => {
    mockGetReadingStats.mockResolvedValue({ totalChapters: 5 });
    mockGetPreference.mockResolvedValue(null);

    const { result } = renderHook(() => useStoreReview());
    await act(async () => {
      await result.current.checkAndPrompt();
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockRequestReview).toHaveBeenCalled();
    expect(mockSetPreference).toHaveBeenCalledWith('store_review_last_version', '2.0.0');
  });

  it('handles store review unavailable gracefully', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    mockGetReadingStats.mockResolvedValue({ totalChapters: 10 });

    const { result } = renderHook(() => useStoreReview());
    await act(async () => {
      await result.current.checkAndPrompt();
    });

    jest.advanceTimersByTime(3000);
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(mockGetReadingStats).not.toHaveBeenCalled();
  });
});
