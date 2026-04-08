import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockStartStudySession = jest.fn();
const mockEndStudySession = jest.fn();
const mockRecordSessionEvent = jest.fn();

jest.mock('@/db/userMutations', () => ({
  startStudySession: (...args: any[]) => mockStartStudySession(...args),
  endStudySession: (...args: any[]) => mockEndStudySession(...args),
  recordSessionEvent: (...args: any[]) => mockRecordSessionEvent(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { useStudyRecorder } from '@/hooks/useStudyRecorder';

describe('useStudyRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStartStudySession.mockResolvedValue(42);
    mockEndStudySession.mockResolvedValue(undefined);
    mockRecordSessionEvent.mockResolvedValue(undefined);
  });

  it('does not start a session when chapterId is undefined', () => {
    renderHook(() => useStudyRecorder(undefined, true));
    expect(mockStartStudySession).not.toHaveBeenCalled();
  });

  it('does not start a session when isPremium is false', () => {
    renderHook(() => useStudyRecorder('gen-1', false));
    expect(mockStartStudySession).not.toHaveBeenCalled();
  });

  it('starts a session when chapterId and isPremium are provided', async () => {
    renderHook(() => useStudyRecorder('gen-1', true));
    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalledWith('gen-1'));
  });

  it('ends session on unmount', async () => {
    const { unmount } = renderHook(() => useStudyRecorder('gen-1', true));

    // Wait for session to be started
    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalled());

    unmount();

    await waitFor(() => expect(mockEndStudySession).toHaveBeenCalled());
    expect(mockEndStudySession).toHaveBeenCalledWith(42, expect.any(Number));
  });

  it('returns recordEvent callback', () => {
    const { result } = renderHook(() => useStudyRecorder('gen-1', true));
    expect(typeof result.current.recordEvent).toBe('function');
  });

  it('recordEvent sends event when session is active', async () => {
    const { result } = renderHook(() => useStudyRecorder('gen-1', true));

    // Wait for session to start
    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalled());

    act(() => {
      result.current.recordEvent('panel_open', { panel_type: 'scholars' });
    });

    expect(mockRecordSessionEvent).toHaveBeenCalledWith(42, {
      event_type: 'panel_open',
      panel_type: 'scholars',
      scholar_id: undefined,
      section_id: undefined,
      timestamp_ms: expect.any(Number),
      metadata_json: undefined,
    });
  });

  it('recordEvent does nothing when no active session', () => {
    const { result } = renderHook(() => useStudyRecorder(undefined, true));

    act(() => {
      result.current.recordEvent('verse_tap');
    });

    expect(mockRecordSessionEvent).not.toHaveBeenCalled();
  });

  it('recordEvent does nothing when isPremium becomes false', async () => {
    // Start with premium
    const { result, rerender } = renderHook(
      ({ chapterId, isPremium }: { chapterId: string | undefined; isPremium: boolean }) =>
        useStudyRecorder(chapterId, isPremium),
      { initialProps: { chapterId: 'gen-1', isPremium: true } },
    );

    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalled());

    // Switch to non-premium — isPremiumRef.current updated, but session still referenced
    rerender({ chapterId: 'gen-1', isPremium: false });

    act(() => {
      result.current.recordEvent('panel_open');
    });

    // isPremiumRef.current is now false, so recordEvent should bail
    expect(mockRecordSessionEvent).not.toHaveBeenCalled();
  });

  it('handles startStudySession error gracefully', async () => {
    mockStartStudySession.mockRejectedValueOnce(new Error('DB error'));
    const { logger } = require('@/utils/logger');

    renderHook(() => useStudyRecorder('gen-1', true));

    await waitFor(() => expect(logger.error).toHaveBeenCalledWith(
      'useStudyRecorder',
      'Failed to start session',
      expect.any(Error),
    ));
  });

  it('restarts session when chapterId changes', async () => {
    const { rerender } = renderHook(
      ({ chapterId }: { chapterId: string }) => useStudyRecorder(chapterId, true),
      { initialProps: { chapterId: 'gen-1' } },
    );

    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalledWith('gen-1'));

    rerender({ chapterId: 'gen-2' });

    // Old session ends, new one starts
    await waitFor(() => expect(mockEndStudySession).toHaveBeenCalled());
    await waitFor(() => expect(mockStartStudySession).toHaveBeenCalledWith('gen-2'));
  });
});
