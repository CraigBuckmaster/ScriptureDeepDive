import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import NotificationFeedScreen from '@/screens/NotificationFeedScreen';

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn().mockReturnValue({
    notifications: [],
    unreadCount: 0,
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    loading: false,
  }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('NotificationFeedScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<NotificationFeedScreen />);
    }).not.toThrow();
  });

  it('renders the notification header', () => {
    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('Notifications')).toBeTruthy();
  });
});
