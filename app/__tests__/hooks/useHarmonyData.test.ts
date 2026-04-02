import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockEntries = [
  {
    id: 'baptism', title: 'The Baptism of Jesus', category: 'gospel',
    period: 'early_ministry', sort_order: 20,
    passages_json: JSON.stringify([{ book: 'matthew', ref: 'Matt 3:13-17' }]),
    diff_annotations_json: '[]',
  },
  {
    id: 'birth', title: 'The Birth of Jesus', category: 'gospel',
    period: 'birth', sort_order: 10,
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 1:18-25' },
      { book: 'luke', ref: 'Luke 2:1-7' },
    ]),
    diff_annotations_json: '[]',
  },
  {
    id: 'crucifixion', title: 'The Crucifixion', category: 'gospel',
    period: 'passion', sort_order: 200,
    passages_json: JSON.stringify([
      { book: 'matthew', ref: 'Matt 27:32-56' },
      { book: 'mark', ref: 'Mark 15:21-41' },
    ]),
    diff_annotations_json: '[]',
  },
];

jest.mock('@/db/content', () => ({
  getHarmonyEntries: jest.fn(() => Promise.resolve(mockEntries)),
}));

describe('useHarmonyData', () => {
  beforeEach(() => jest.clearAllMocks());

  it('groups entries by period in correct order', async () => {
    const { useHarmonyData } = require('@/hooks/useHarmonyData');
    const { result } = renderHook(() => useHarmonyData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.sections).toHaveLength(3);
    expect(result.current.sections[0].period).toBe('birth');
    expect(result.current.sections[1].period).toBe('early_ministry');
    expect(result.current.sections[2].period).toBe('passion');
  });

  it('filters by period', async () => {
    const { useHarmonyData } = require('@/hooks/useHarmonyData');
    const { result } = renderHook(() => useHarmonyData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPeriodFilter('birth'));
    expect(result.current.sections).toHaveLength(1);
    expect(result.current.sections[0].data).toHaveLength(1);
    expect(result.current.sections[0].data[0].id).toBe('birth');
  });

  it('filters by search text (case insensitive)', async () => {
    const { useHarmonyData } = require('@/hooks/useHarmonyData');
    const { result } = renderHook(() => useHarmonyData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSearch('baptism'));
    expect(result.current.sections).toHaveLength(1);
    expect(result.current.sections[0].data[0].id).toBe('baptism');
  });

  it('returns empty sections when no matches', async () => {
    const { useHarmonyData } = require('@/hooks/useHarmonyData');
    const { result } = renderHook(() => useHarmonyData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSearch('nonexistent'));
    expect(result.current.sections).toHaveLength(0);
  });

  it('resets to all when period filter set back to all', async () => {
    const { useHarmonyData } = require('@/hooks/useHarmonyData');
    const { result } = renderHook(() => useHarmonyData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPeriodFilter('birth'));
    expect(result.current.sections).toHaveLength(1);
    act(() => result.current.setPeriodFilter('all'));
    expect(result.current.sections).toHaveLength(3);
  });
});
