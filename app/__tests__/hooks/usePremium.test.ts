/**
 * Hook tests for usePremium.
 */
import { renderHook, act } from '@testing-library/react-native';

let mockIsPremium = false;

jest.mock('@/stores/premiumStore', () => ({
  usePremiumStore: (selector: (s: any) => any) => {
    return selector({ isPremium: mockIsPremium });
  },
}));

import { usePremium } from '@/hooks/usePremium';

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPremium = false;
});

describe('usePremium', () => {
  it('returns isPremium as false by default', () => {
    const { result } = renderHook(() => usePremium());
    expect(result.current.isPremium).toBe(false);
    expect(result.current.upgradeRequest).toBeNull();
  });

  it('returns isPremium as true when store says so', () => {
    mockIsPremium = true;
    const { result } = renderHook(() => usePremium());
    expect(result.current.isPremium).toBe(true);
  });

  it('showUpgrade sets upgradeRequest', () => {
    const { result } = renderHook(() => usePremium());
    act(() => result.current.showUpgrade('feature', 'Interlinear'));
    expect(result.current.upgradeRequest).toEqual({
      variant: 'feature',
      featureName: 'Interlinear',
    });
  });

  it('dismissUpgrade clears upgradeRequest', () => {
    const { result } = renderHook(() => usePremium());
    act(() => result.current.showUpgrade('feature', 'Interlinear'));
    expect(result.current.upgradeRequest).not.toBeNull();
    act(() => result.current.dismissUpgrade());
    expect(result.current.upgradeRequest).toBeNull();
  });
});
