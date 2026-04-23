import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetProofTextGuard = jest.fn();

jest.mock('@/db/content', () => ({
  getProofTextGuard: (...args: any[]) => mockGetProofTextGuard(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useProofTextGuard } from '@/hooks/useProofTextGuard';

describe('useProofTextGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null and does not query when verseNum is not provided', () => {
    const { result } = renderHook(() => useProofTextGuard('jeremiah', 29));
    expect(result.current).toBeNull();
    expect(mockGetProofTextGuard).not.toHaveBeenCalled();
  });

  it('loads and returns the guard row for the (book, chapter, verse) triple', async () => {
    const guard = {
      ref: 'jeremiah 29:11',
      book_id: 'jeremiah',
      chapter_num: 29,
      verse_num: 11,
      common_misreading: 'Personal promise of prosperity',
      actual_context_summary: 'Letter to Judean exiles in Babylon',
      suggested_book_id: 'jeremiah',
      suggested_chapter_num: 29,
    };
    mockGetProofTextGuard.mockResolvedValue(guard);

    const { result } = renderHook(() => useProofTextGuard('jeremiah', 29, 11));
    await waitFor(() => {
      expect(result.current).toEqual(guard);
    });
    expect(mockGetProofTextGuard).toHaveBeenCalledWith('jeremiah', 29, 11);
  });

  it('returns null when the lookup fails', async () => {
    mockGetProofTextGuard.mockRejectedValue(new Error('db error'));
    const { result } = renderHook(() => useProofTextGuard('jeremiah', 29, 11));
    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });
});
