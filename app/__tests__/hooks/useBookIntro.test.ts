import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getBookIntro: jest.fn().mockResolvedValue({
    intro_json: '{"title":"Genesis","author":"Moses","theme":"Origins"}',
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  safeParse: jest.fn((json: string, fallback: any) => {
    try { return JSON.parse(json); } catch { return fallback; }
  }),
}));

import { useBookIntro } from '@/hooks/useBookIntro';
const { getBookIntro } = require('@/db/content');

describe('useBookIntro', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { result } = renderHook(() => useBookIntro('genesis'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.intro).toBeNull();
  });

  it('loads and parses intro JSON', async () => {
    const { result } = renderHook(() => useBookIntro('genesis'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.intro).toEqual({ title: 'Genesis', author: 'Moses', theme: 'Origins' });
    expect(getBookIntro).toHaveBeenCalledWith('genesis');
  });

  it('returns null intro when DB returns null', async () => {
    getBookIntro.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useBookIntro('unknown'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.intro).toBeNull();
  });

  it('does not fetch when bookId is null', () => {
    const { result } = renderHook(() => useBookIntro(null));
    expect(getBookIntro).not.toHaveBeenCalled();
    expect(result.current.intro).toBeNull();
  });
});
