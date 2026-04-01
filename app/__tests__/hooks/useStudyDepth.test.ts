import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: mockGetAllAsync,
    runAsync: mockRunAsync,
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useStudyDepth } from '@/hooks/useStudyDepth';

describe('useStudyDepth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllAsync.mockResolvedValue([]);
    mockRunAsync.mockResolvedValue({ changes: 1 });
  });

  it('returns an empty depth map when no panels are provided', async () => {
    const sectionPanels = new Map();
    const { result } = renderHook(() => useStudyDepth('genesis-1', sectionPanels));

    await waitFor(() => {
      expect(mockGetAllAsync).toHaveBeenCalled();
    });

    expect(result.current.depthMap.size).toBe(0);
  });

  it('returns depth info with explored and total counts', async () => {
    mockGetAllAsync.mockResolvedValue([
      { section_id: 'sec1', panel_type: 'heb' },
    ]);

    const sectionPanels = new Map([
      ['sec1', [
        { panel_type: 'heb' },
        { panel_type: 'hist' },
        { panel_type: 'cross' },
      ]],
    ]) as any;

    const { result } = renderHook(() => useStudyDepth('genesis-1', sectionPanels));

    await waitFor(() => {
      const info = result.current.depthMap.get('sec1');
      expect(info).toEqual({ explored: 1, total: 3 });
    });
  });

  it('recordOpen tracks a new panel open', async () => {
    mockGetAllAsync.mockResolvedValue([]);

    const sectionPanels = new Map([
      ['sec1', [
        { panel_type: 'heb' },
        { panel_type: 'hist' },
      ]],
    ]) as any;

    const { result } = renderHook(() => useStudyDepth('genesis-1', sectionPanels));

    await waitFor(() => {
      expect(mockGetAllAsync).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.recordOpen('sec1', 'heb');
    });

    expect(mockRunAsync).toHaveBeenCalledWith(
      'INSERT OR IGNORE INTO study_depth (chapter_id, section_id, panel_type) VALUES (?, ?, ?)',
      ['genesis-1', 'sec1', 'heb']
    );
  });

  it('does not track untracked panel types', async () => {
    mockGetAllAsync.mockResolvedValue([]);

    const sectionPanels = new Map([
      ['sec1', [{ panel_type: 'heb' }]],
    ]) as any;

    const { result } = renderHook(() => useStudyDepth('genesis-1', sectionPanels));

    await waitFor(() => {
      expect(mockGetAllAsync).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.recordOpen('sec1', 'notes');
    });

    expect(mockRunAsync).not.toHaveBeenCalled();
  });

  it('does not record if chapterId is undefined', async () => {
    const sectionPanels = new Map() as any;
    const { result } = renderHook(() => useStudyDepth(undefined, sectionPanels));

    await act(async () => {
      await result.current.recordOpen('sec1', 'heb');
    });

    expect(mockRunAsync).not.toHaveBeenCalled();
  });
});
