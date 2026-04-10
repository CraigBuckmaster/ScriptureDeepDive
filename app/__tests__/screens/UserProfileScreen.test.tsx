import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import UserProfileScreen from '@/screens/UserProfileScreen';

jest.mock('@/stores', () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      user: { id: 'user-1', email: 'test@example.com', user_metadata: {}, app_metadata: {} },
      isLoading: false,
      signOut: jest.fn(),
    }),
  ),
}));

jest.mock('@/db/userQueries', () => ({
  getAuthProfile: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/db/userMutations', () => ({
  upsertAuthProfile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useMySubmissions', () => ({
  useMySubmissions: jest.fn().mockReturnValue({
    submissions: [],
    loading: false,
  }),
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

describe('UserProfileScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<UserProfileScreen />);
    }).not.toThrow();
  });

  it('renders the profile header', () => {
    const { getByText } = renderWithProviders(<UserProfileScreen />);
    expect(getByText('Profile')).toBeTruthy();
  });
});
