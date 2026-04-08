import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn();

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => ({
    getAllAsync: (...args: any[]) => mockGetAllAsync(...args),
    runAsync: (...args: any[]) => mockRunAsync(...args),
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

import { useNotifications } from '@/hooks/useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunAsync.mockResolvedValue(undefined);
  });

  it('starts in loading state', () => {
    mockGetAllAsync.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useNotifications());
    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('loads notifications and normalizes is_read booleans', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: '1', type: 'comment', title: 'New', body: 'body', is_read: 0, created_at: '2026-01-01' },
      { id: '2', type: 'like', title: 'Like', body: 'body', is_read: 1, created_at: '2026-01-02' },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].is_read).toBe(false);
    expect(result.current.notifications[1].is_read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it('sets unreadCount to the number of unread notifications', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: '1', is_read: 0, type: 'a', title: '', body: '', created_at: '' },
      { id: '2', is_read: 0, type: 'b', title: '', body: '', created_at: '' },
      { id: '3', is_read: 1, type: 'c', title: '', body: '', created_at: '' },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it('handles load failure gracefully', async () => {
    mockGetAllAsync.mockRejectedValue(new Error('DB error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('markRead updates a single notification to read', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 0, type: 'x', title: '', body: '', created_at: '' },
      { id: 'n2', is_read: 0, type: 'y', title: '', body: '', created_at: '' },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(2);

    await act(async () => {
      await result.current.markRead('n1');
    });

    expect(mockRunAsync).toHaveBeenCalledWith(
      'UPDATE app_notifications SET is_read = 1 WHERE id = ?',
      ['n1'],
    );
    expect(result.current.notifications.find((n) => n.id === 'n1')?.is_read).toBe(true);
    expect(result.current.notifications.find((n) => n.id === 'n2')?.is_read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('markRead does not go below zero', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 1, type: 'x', title: '', body: '', created_at: '' },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.unreadCount).toBe(0);

    await act(async () => {
      await result.current.markRead('n1');
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('markRead handles errors gracefully', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 0, type: 'x', title: '', body: '', created_at: '' },
    ]);
    mockRunAsync.mockRejectedValue(new Error('DB write error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markRead('n1');
    });

    // Should not throw
    expect(result.current.unreadCount).toBe(1);
  });

  it('markAllRead marks every notification as read', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 0, type: 'x', title: '', body: '', created_at: '' },
      { id: 'n2', is_read: 0, type: 'y', title: '', body: '', created_at: '' },
    ]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(mockRunAsync).toHaveBeenCalledWith(
      'UPDATE app_notifications SET is_read = 1 WHERE is_read = 0',
    );
    expect(result.current.notifications.every((n) => n.is_read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('markAllRead handles errors gracefully', async () => {
    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 0, type: 'x', title: '', body: '', created_at: '' },
    ]);
    mockRunAsync.mockRejectedValue(new Error('DB write error'));

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAllRead();
    });

    // Should not throw; state unchanged because error in try block
    expect(result.current.unreadCount).toBe(1);
  });

  it('refresh reloads notifications', async () => {
    mockGetAllAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAllAsync).toHaveBeenCalledTimes(1);

    mockGetAllAsync.mockResolvedValue([
      { id: 'n1', is_read: 0, type: 'x', title: 'New', body: '', created_at: '' },
    ]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAllAsync).toHaveBeenCalledTimes(2);
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });
});
