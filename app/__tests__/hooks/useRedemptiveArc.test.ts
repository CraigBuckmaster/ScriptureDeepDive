/**
 * Hook tests for useRedemptiveArc.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetRedemptiveActs = jest.fn();
const mockGetRedemptiveAct = jest.fn();

jest.mock('@/db/content', () => ({
  getRedemptiveActs: (...args: any[]) => mockGetRedemptiveActs(...args),
  getRedemptiveAct: (...args: any[]) => mockGetRedemptiveAct(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  safeParse: (val: any, fallback: any) => {
    if (!val) return fallback;
    try { return JSON.parse(val); } catch { return fallback; }
  },
}));

import { useRedemptiveArc, useRedemptiveActDetail } from '@/hooks/useRedemptiveArc';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetRedemptiveActs.mockResolvedValue([]);
  mockGetRedemptiveAct.mockResolvedValue(null);
});

describe('useRedemptiveArc', () => {
  it('starts loading and resolves', async () => {
    const { result } = renderHook(() => useRedemptiveArc());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.acts).toEqual([]);
  });

  it('parses act rows with JSON fields', async () => {
    mockGetRedemptiveActs.mockResolvedValue([
      {
        id: 'creation',
        act_order: 1,
        name: 'Creation',
        tagline: 'In the beginning',
        summary: null,
        key_verse: '{"ref":"gen 1:1","text":"In the beginning"}',
        era_ids: '["patriarchs"]',
        book_range: null,
        threads: '["creation"]',
        prophecy_chains: '[]',
      },
    ]);
    const { result } = renderHook(() => useRedemptiveArc());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.acts).toHaveLength(1);
    expect(result.current.acts[0].era_ids).toEqual(['patriarchs']);
    expect(result.current.acts[0].key_verse).toEqual({ ref: 'gen 1:1', text: 'In the beginning' });
  });
});

describe('useRedemptiveActDetail', () => {
  it('returns null when actId is null', async () => {
    const { result } = renderHook(() => useRedemptiveActDetail(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.act).toBeNull();
  });

  it('loads a single act', async () => {
    mockGetRedemptiveAct.mockResolvedValue({
      id: 'creation',
      act_order: 1,
      name: 'Creation',
      tagline: null,
      summary: null,
      key_verse: null,
      era_ids: null,
      book_range: null,
      threads: null,
      prophecy_chains: null,
    });
    const { result } = renderHook(() => useRedemptiveActDetail('creation'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.act).not.toBeNull();
    expect(result.current.act!.name).toBe('Creation');
  });
});
