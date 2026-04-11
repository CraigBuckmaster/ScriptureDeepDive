/**
 * Hook tests for useEras.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetEras = jest.fn();

jest.mock('@/db/content', () => ({
  getEras: (...args: any[]) => mockGetEras(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  safeParse: (val: any, fallback: any) => {
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  },
}));

import { useEras } from '@/hooks/useEras';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetEras.mockResolvedValue([]);
});

describe('useEras', () => {
  it('starts loading and resolves to empty', async () => {
    const { result } = renderHook(() => useEras());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.eras).toEqual([]);
  });

  it('parses era rows with JSON fields', async () => {
    mockGetEras.mockResolvedValue([
      {
        id: 'patriarchs',
        name: 'Patriarchs',
        pill: null,
        hex: null,
        range_start: -2000,
        range_end: -1500,
        summary: null,
        narrative: null,
        key_themes: '["covenant","promise"]',
        key_people: '["abraham"]',
        books: '["genesis"]',
        geographic_center: '{"region":"Canaan","place_ids":[]}',
        chapter_range: null,
        redemptive_thread: null,
        transition_to_next: null,
      },
    ]);
    const { result } = renderHook(() => useEras());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.eras).toHaveLength(1);
    expect(result.current.eras[0].key_themes).toEqual(['covenant', 'promise']);
    expect(result.current.eras[0].books).toEqual(['genesis']);
  });

  it('uses fallback for invalid JSON fields', async () => {
    mockGetEras.mockResolvedValue([
      {
        id: 'test',
        name: 'Test',
        pill: null,
        hex: null,
        range_start: null,
        range_end: null,
        summary: null,
        narrative: null,
        key_themes: 'invalid',
        key_people: null,
        books: null,
        geographic_center: null,
        chapter_range: null,
        redemptive_thread: null,
        transition_to_next: null,
      },
    ]);
    const { result } = renderHook(() => useEras());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.eras[0].key_people).toEqual([]);
    expect(result.current.eras[0].books).toEqual([]);
    expect(result.current.eras[0].geographic_center).toBeNull();
  });
});
