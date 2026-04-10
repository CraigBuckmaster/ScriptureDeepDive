import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import NotificationPrefsScreen from '@/screens/NotificationPrefsScreen';

jest.mock('@/db/user', () => ({
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('NotificationPrefsScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<NotificationPrefsScreen />);
    }).not.toThrow();
  });

  it('renders the screen header after loading', async () => {
    const { getByText } = renderWithProviders(<NotificationPrefsScreen />);
    await waitFor(() => {
      expect(getByText('Notification Preferences')).toBeTruthy();
    });
  });
});
