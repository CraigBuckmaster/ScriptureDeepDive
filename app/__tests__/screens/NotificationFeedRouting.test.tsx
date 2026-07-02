/**
 * #1841 — tapping a review-due nudge in the notification feed routes
 * to the Study tab hub (flag-aware) and marks it read.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockParentNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      getParent: () => ({ navigate: mockParentNavigate }),
    }),
    useRoute: () => ({ params: {} }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

const mockIsFlagEnabled = jest.fn().mockReturnValue(true);
jest.mock('@/config/featureFlags', () => ({
  isFlagEnabled: (...args: unknown[]) => mockIsFlagEnabled(...args),
}));

const mockMarkRead = jest.fn();
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

function stubNotifications() {
  const { useNotifications } = require('@/hooks/useNotifications');
  useNotifications.mockReturnValue({
    notifications: [
      {
        id: 'review_due_2026-07-02',
        type: 'review_due',
        title: 'Ready to revisit',
        body: '3 review prompts are ready when you are.',
        target_type: 'study_hub',
        is_read: false,
        created_at: '2026-07-02 08:00:00',
      },
    ],
    unreadCount: 1,
    markRead: mockMarkRead,
    markAllRead: jest.fn(),
    loading: false,
  });
}

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));
jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));

import NotificationFeedScreen from '@/screens/NotificationFeedScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockIsFlagEnabled.mockReturnValue(true);
  stubNotifications();
});

describe('NotificationFeedScreen review-nudge routing (#1841)', () => {
  it('flag on: tapping the nudge marks it read and lands on the Study hub', () => {
    const { getByText } = render(<NotificationFeedScreen />);
    fireEvent.press(getByText('3 review prompts are ready when you are.'));
    expect(mockMarkRead).toHaveBeenCalledWith('review_due_2026-07-02');
    expect(mockParentNavigate).toHaveBeenCalledWith('ExploreTab', { screen: 'StudyHub' });
  });

  it('flag off: the same tap falls back to the ExploreMenu root', () => {
    mockIsFlagEnabled.mockReturnValue(false);
    const { getByText } = render(<NotificationFeedScreen />);
    fireEvent.press(getByText('3 review prompts are ready when you are.'));
    expect(mockParentNavigate).toHaveBeenCalledWith('ExploreTab', { screen: 'ExploreMenu' });
  });
});
