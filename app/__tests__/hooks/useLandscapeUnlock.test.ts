import { renderHook } from '@testing-library/react-native';

jest.mock('expo-screen-orientation', () => ({
  unlockAsync: jest.fn().mockResolvedValue(undefined),
  lockAsync: jest.fn().mockResolvedValue(undefined),
  OrientationLock: { PORTRAIT_UP: 'PORTRAIT_UP' },
}));

import { useLandscapeUnlock } from '@/hooks/useLandscapeUnlock';
const ScreenOrientation = require('expo-screen-orientation');

describe('useLandscapeUnlock', () => {
  beforeEach(() => jest.clearAllMocks());

  it('unlocks orientation on mount', () => {
    renderHook(() => useLandscapeUnlock());
    expect(ScreenOrientation.unlockAsync).toHaveBeenCalledTimes(1);
  });

  it('re-locks to portrait on unmount', () => {
    const { unmount } = renderHook(() => useLandscapeUnlock());
    expect(ScreenOrientation.lockAsync).not.toHaveBeenCalled();
    unmount();
    expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith('PORTRAIT_UP');
  });
});
