/**
 * Hook tests for usePushNotifications.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockRegisterForPushNotifications = jest.fn();
const mockGetStoredPushToken = jest.fn();

jest.mock('@/services/pushNotifications', () => ({
  registerForPushNotifications: (...args: any[]) => mockRegisterForPushNotifications(...args),
  getStoredPushToken: (...args: any[]) => mockGetStoredPushToken(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { usePushNotifications } from '@/hooks/usePushNotifications';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStoredPushToken.mockResolvedValue(null);
  mockRegisterForPushNotifications.mockResolvedValue(null);
});

describe('usePushNotifications', () => {
  it('returns existing token if stored', async () => {
    mockGetStoredPushToken.mockResolvedValue('existing-token');
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.isRegistered).toBe(true));
    expect(result.current.token).toBe('existing-token');
  });

  it('registers for new token when none stored', async () => {
    mockRegisterForPushNotifications.mockResolvedValue('new-token');
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.isRegistered).toBe(true));
    expect(result.current.token).toBe('new-token');
  });

  it('handles registration failure gracefully', async () => {
    mockRegisterForPushNotifications.mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => usePushNotifications());
    // Should not throw — stays unregistered
    await waitFor(() => expect(mockRegisterForPushNotifications).toHaveBeenCalled());
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.token).toBeNull();
  });
});
