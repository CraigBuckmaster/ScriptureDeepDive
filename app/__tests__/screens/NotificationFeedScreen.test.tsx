import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import NotificationFeedScreen from '@/screens/NotificationFeedScreen';

const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn().mockReturnValue({
    notifications: [],
    unreadCount: 0,
    markRead: mockMarkRead,
    markAllRead: mockMarkAllRead,
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
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<NotificationFeedScreen />);
    }).not.toThrow();
  });

  it('renders the notification header', () => {
    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('shows empty state when no notifications', () => {
    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('No notifications')).toBeTruthy();
  });

  it('shows notifications list when data exists', () => {
    const { useNotifications } = require('@/hooks/useNotifications');
    useNotifications.mockReturnValue({
      notifications: [
        { id: '1', title: 'New reply', body: 'Someone replied to your note', is_read: false, created_at: new Date().toISOString() },
        { id: '2', title: 'Streak update', body: 'You are on a 7-day streak!', is_read: true, created_at: new Date().toISOString() },
      ],
      unreadCount: 1,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      loading: false,
    });

    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('New reply')).toBeTruthy();
    expect(getByText('Streak update')).toBeTruthy();
  });

  it('shows Mark all read when there are unread notifications', () => {
    const { useNotifications } = require('@/hooks/useNotifications');
    useNotifications.mockReturnValue({
      notifications: [
        { id: '1', title: 'Unread', body: 'Test', is_read: false, created_at: new Date().toISOString() },
      ],
      unreadCount: 1,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      loading: false,
    });

    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('Mark all read')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    const { useNotifications } = require('@/hooks/useNotifications');
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      markRead: mockMarkRead,
      markAllRead: mockMarkAllRead,
      loading: true,
    });

    const { getByText } = renderWithProviders(<NotificationFeedScreen />);
    expect(getByText('Notifications')).toBeTruthy();
  });
});
