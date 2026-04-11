import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import LifeTopicDetailScreen from '@/screens/LifeTopicDetailScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { topicId: 'topic-1' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/hooks/useLifeTopics', () => ({
  useLifeTopicDetail: jest.fn().mockReturnValue({
    topic: null,
    verses: [],
    scholars: [],
    related: [],
    loading: false,
  }),
  useLifeTopicCategories: jest.fn().mockReturnValue({ data: [] }),
}));

jest.mock('@/hooks/useSubmissionFeed', () => ({
  useSubmissionFeed: jest.fn().mockReturnValue({ submissions: [] }),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: false,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseDotReference: jest.fn(),
  parseReference: jest.fn(),
}));

jest.mock('@/utils/shareLifeTopic', () => ({
  shareLifeTopic: jest.fn(),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/CollapsibleSection', () => ({ CollapsibleSection: () => null }));
jest.mock('@/components/UpgradePrompt', () => ({ UpgradePrompt: () => null }));
jest.mock('@/components/BadgeChip', () => ({ BadgeChip: () => null }));
jest.mock('@/components/lifetopics', () => ({
  VerseCard: () => null,
  ScholarQuoteCard: () => null,
  RelatedTopics: () => null,
  CommunityPerspectives: () => null,
}));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('LifeTopicDetailScreen', () => {
  it('renders header when topic is not found', () => {
    const { getByText } = renderWithProviders(<LifeTopicDetailScreen />);
    expect(getByText('Life Topic')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<LifeTopicDetailScreen />);
    }).not.toThrow();
  });
});
