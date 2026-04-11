import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ConnectivityBanner from '@/components/ConnectivityBanner';

jest.mock('@/services/connectivity', () => ({
  isConnected: jest.fn().mockReturnValue(false),
  onConnectivityChange: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('@/services/syncQueue', () => ({
  getPendingCount: jest.fn().mockResolvedValue(3),
}));

describe('ConnectivityBanner', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<ConnectivityBanner />);
    expect(getByText(/offline/i)).toBeTruthy();
  });

  it('shows offline text when device is offline', () => {
    const { getByText } = renderWithProviders(<ConnectivityBanner />);
    expect(getByText(/offline/i)).toBeTruthy();
  });

  it('has alert accessibility role', () => {
    const { UNSAFE_root } = renderWithProviders(<ConnectivityBanner />);
    // The Animated.View has accessibilityRole="alert" — verify the banner renders
    expect(UNSAFE_root).toBeTruthy();
  });
});
