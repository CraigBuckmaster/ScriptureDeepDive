import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
const { getPreference, setPreference } = require('@/db/user');

describe('useOnboardingStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with null (loading)', () => {
    const { result } = renderHook(() => useOnboardingStatus());
    expect(result.current.isFirstLaunch).toBeNull();
  });

  it('returns true for first launch (no preference set)', async () => {
    getPreference.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useOnboardingStatus());
    await waitFor(() => expect(result.current.isFirstLaunch).toBe(true));
  });

  it('returns false when onboarding already completed', async () => {
    getPreference.mockResolvedValueOnce('1');
    const { result } = renderHook(() => useOnboardingStatus());
    await waitFor(() => expect(result.current.isFirstLaunch).toBe(false));
  });

  it('markComplete saves preference and sets isFirstLaunch to false', async () => {
    getPreference.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useOnboardingStatus());
    await waitFor(() => expect(result.current.isFirstLaunch).toBe(true));

    await act(async () => {
      await result.current.markComplete();
    });

    expect(setPreference).toHaveBeenCalledWith('onboarding_complete', '1');
    expect(result.current.isFirstLaunch).toBe(false);
  });
});
