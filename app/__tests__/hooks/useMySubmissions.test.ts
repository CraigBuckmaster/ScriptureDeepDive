/**
 * Hook tests for useMySubmissions.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/stores', () => ({
  useAuthStore: (selector: (s: any) => any) => {
    return selector({ user: { id: 'user1' } });
  },
}));

const mockFrom = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [] }),
    }),
  }),
});

jest.mock('@/lib/supabase', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

import { useMySubmissions } from '@/hooks/useMySubmissions';

beforeEach(() => jest.clearAllMocks());

describe('useMySubmissions', () => {
  it('starts loading and resolves', async () => {
    const { result } = renderHook(() => useMySubmissions());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.submissions).toEqual([]);
  });

  it('provides a reload function', async () => {
    const { result } = renderHook(() => useMySubmissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.reload).toBe('function');
  });

  it('returns empty submissions array on error', async () => {
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockRejectedValue(new Error('fail')),
        }),
      }),
    });
    const { result } = renderHook(() => useMySubmissions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.submissions).toEqual([]);
  });
});
