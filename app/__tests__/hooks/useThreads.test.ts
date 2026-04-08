import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetCrossRefThreads = jest.fn();
const mockGetCrossRefThread = jest.fn();

jest.mock('@/db/content', () => ({
  getCrossRefThreads: (...args: any[]) => mockGetCrossRefThreads(...args),
  getCrossRefThread: (...args: any[]) => mockGetCrossRefThread(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useThreads, useThreadDetail } from '@/hooks/useThreads';

describe('useThreads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state with empty threads', () => {
    mockGetCrossRefThreads.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useThreads());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.threads).toEqual([]);
  });

  it('loads and parses threads', async () => {
    mockGetCrossRefThreads.mockResolvedValue([
      {
        id: 't1',
        theme: 'Grace',
        tags_json: '["grace","mercy"]',
        steps_json: '[{"ref":"John 3:16","note":"For God so loved"}]',
      },
      {
        id: 't2',
        theme: 'Faith',
        tags_json: '["faith"]',
        steps_json: '[{"ref":"Heb 11:1","note":"Substance of things hoped"}]',
      },
    ]);

    const { result } = renderHook(() => useThreads());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threads).toHaveLength(2);
    expect(result.current.threads[0]).toEqual({
      id: 't1',
      theme: 'Grace',
      tags: ['grace', 'mercy'],
      steps: [{ ref: 'John 3:16', note: 'For God so loved' }],
    });
    expect(result.current.threads[1]).toEqual({
      id: 't2',
      theme: 'Faith',
      tags: ['faith'],
      steps: [{ ref: 'Heb 11:1', note: 'Substance of things hoped' }],
    });
  });

  it('handles invalid tags_json gracefully', async () => {
    mockGetCrossRefThreads.mockResolvedValue([
      {
        id: 't1',
        theme: 'Broken',
        tags_json: 'not valid json',
        steps_json: '[]',
      },
    ]);

    const { result } = renderHook(() => useThreads());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threads[0].tags).toEqual([]);
    expect(result.current.threads[0].steps).toEqual([]);
  });

  it('handles null tags_json', async () => {
    mockGetCrossRefThreads.mockResolvedValue([
      {
        id: 't1',
        theme: 'NoTags',
        tags_json: null,
        steps_json: '[{"ref":"Gen 1:1","note":"beginning"}]',
      },
    ]);

    const { result } = renderHook(() => useThreads());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threads[0].tags).toEqual([]);
    expect(result.current.threads[0].steps).toEqual([
      { ref: 'Gen 1:1', note: 'beginning' },
    ]);
  });

  it('handles invalid steps_json gracefully', async () => {
    mockGetCrossRefThreads.mockResolvedValue([
      {
        id: 't1',
        theme: 'BadSteps',
        tags_json: '["tag"]',
        steps_json: '{broken',
      },
    ]);

    const { result } = renderHook(() => useThreads());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threads[0].tags).toEqual(['tag']);
    expect(result.current.threads[0].steps).toEqual([]);
  });

  it('handles fetch error gracefully', async () => {
    mockGetCrossRefThreads.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useThreads());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.threads).toEqual([]);
  });
});

describe('useThreadDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in loading state with null thread', () => {
    mockGetCrossRefThread.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useThreadDetail('t1'));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.thread).toBeNull();
  });

  it('loads and parses a single thread', async () => {
    mockGetCrossRefThread.mockResolvedValue({
      id: 't1',
      theme: 'Grace',
      tags_json: '["grace"]',
      steps_json: '[{"ref":"Eph 2:8","note":"By grace through faith"}]',
    });

    const { result } = renderHook(() => useThreadDetail('t1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thread).toEqual({
      id: 't1',
      theme: 'Grace',
      tags: ['grace'],
      steps: [{ ref: 'Eph 2:8', note: 'By grace through faith' }],
    });
    expect(mockGetCrossRefThread).toHaveBeenCalledWith('t1');
  });

  it('sets thread to null when not found', async () => {
    mockGetCrossRefThread.mockResolvedValue(null);

    const { result } = renderHook(() => useThreadDetail('nonexistent'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thread).toBeNull();
  });

  it('handles fetch error gracefully', async () => {
    mockGetCrossRefThread.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useThreadDetail('t1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thread).toBeNull();
  });

  it('refetches when threadId changes', async () => {
    mockGetCrossRefThread.mockResolvedValue({
      id: 't1',
      theme: 'Grace',
      tags_json: '[]',
      steps_json: '[]',
    });

    const { result, rerender } = renderHook(
      ({ threadId }: { threadId: string }) => useThreadDetail(threadId),
      { initialProps: { threadId: 't1' } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.thread?.id).toBe('t1');

    mockGetCrossRefThread.mockResolvedValue({
      id: 't2',
      theme: 'Faith',
      tags_json: '["faith"]',
      steps_json: '[]',
    });

    rerender({ threadId: 't2' });

    await waitFor(() => {
      expect(result.current.thread?.id).toBe('t2');
    });

    expect(mockGetCrossRefThread).toHaveBeenCalledWith('t2');
  });
});
