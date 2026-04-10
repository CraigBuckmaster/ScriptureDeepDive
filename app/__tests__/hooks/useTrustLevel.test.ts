/**
 * Hook tests for useTrustLevel.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetUserTrustScore = jest.fn();

jest.mock('@/stores', () => ({
  useAuthStore: (selector: (s: any) => any) => {
    return selector({ user: { id: 'user1' } });
  },
}));

jest.mock('@/services/trustLevel', () => ({
  getUserTrustScore: (...args: any[]) => mockGetUserTrustScore(...args),
  TRUST_LABELS: { 0: 'New Member', 1: 'Contributor', 2: 'Trusted' },
}));

import { useTrustLevel } from '@/hooks/useTrustLevel';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserTrustScore.mockResolvedValue({ level: 0, score: 0, label: 'New Member' });
});

describe('useTrustLevel', () => {
  it('starts loading and resolves with trust score', async () => {
    const { result } = renderHook(() => useTrustLevel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.level).toBe(0);
    expect(result.current.label).toBe('New Member');
  });

  it('returns elevated trust level', async () => {
    mockGetUserTrustScore.mockResolvedValue({ level: 2, score: 100, label: 'Trusted' });
    const { result } = renderHook(() => useTrustLevel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.level).toBe(2);
    expect(result.current.label).toBe('Trusted');
  });

  it('provides reload function', async () => {
    const { result } = renderHook(() => useTrustLevel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.reload).toBe('function');
  });
});
