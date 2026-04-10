import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LifeTopicsScreen from '@/screens/LifeTopicsScreen';

jest.mock('@/hooks/useLifeTopics', () => ({
  useLifeTopicCategories: jest.fn().mockReturnValue({ data: [], loading: false }),
  useLifeTopics: jest.fn().mockReturnValue({ data: [], loading: false }),
  useLifeTopicSearch: jest.fn().mockReturnValue({
    search: '',
    setSearch: jest.fn(),
    results: [],
    searching: false,
  }),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: false,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

jest.mock('@/hooks/useFollowingFeed', () => ({
  useFollowingFeed: jest.fn().mockReturnValue({
    feed: [],
    loading: false,
    hasFollows: false,
  }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/SearchInput', () => ({ SearchInput: () => null }));
jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/UpgradePrompt', () => ({ UpgradePrompt: () => null }));
jest.mock('@/components/lifetopics', () => ({
  TopicListItem: () => null,
}));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('LifeTopicsScreen', () => {
  it('renders the screen title', () => {
    const { getByText } = renderWithProviders(<LifeTopicsScreen />);
    expect(getByText('Life Topics')).toBeTruthy();
  });

  it('renders browse/following tabs', () => {
    const { getByText } = renderWithProviders(<LifeTopicsScreen />);
    expect(getByText('Browse')).toBeTruthy();
    expect(getByText('Following')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<LifeTopicsScreen />);
    }).not.toThrow();
  });
});
