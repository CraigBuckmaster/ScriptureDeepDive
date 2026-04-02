import { renderHook } from '@testing-library/react-native';

const mockLogEvent = jest.fn();

jest.mock('@/services/analytics', () => ({
  logEvent: (...args: any[]) => mockLogEvent(...args),
}));

import { useScreenView } from '@/hooks/useScreenView';

describe('useScreenView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs screen_view event on focus with screen name', () => {
    renderHook(() => useScreenView('HomeScreen'));

    expect(mockLogEvent).toHaveBeenCalledWith('screen_view', { screen: 'HomeScreen' });
  });

  it('logs different screen names correctly', () => {
    renderHook(() => useScreenView('ReaderScreen'));

    expect(mockLogEvent).toHaveBeenCalledWith('screen_view', { screen: 'ReaderScreen' });
  });

  it('calls logEvent exactly once per mount', () => {
    renderHook(() => useScreenView('Settings'));

    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });
});
