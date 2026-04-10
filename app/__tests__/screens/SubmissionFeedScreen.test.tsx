import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/hooks/useSubmissionFeed', () => ({
  useSubmissionFeed: jest.fn().mockReturnValue({
    submissions: [
      {
        id: 'sub1',
        title: 'On Grace',
        author_name: 'Jane',
        body: 'Grace is a foundational concept...',
        upvote_count: 5,
        star_avg: 3.8,
      },
    ],
    loading: false,
    loadMore: jest.fn(),
  }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/lifetopics/SubmissionCard', () => {
  const RN = require('react-native');
  return {
    __esModule: true,
    default: ({ title }: any) => <RN.Text>{title}</RN.Text>,
  };
});

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn() }),
}));

import SubmissionFeedScreen from '@/screens/SubmissionFeedScreen';

describe('SubmissionFeedScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubmissionFeedScreen />);
    }).not.toThrow();
  });

  it('shows the screen title', () => {
    const { getByText } = renderWithProviders(<SubmissionFeedScreen />);
    expect(getByText('Community Submissions')).toBeTruthy();
  });

  it('shows sort toggle buttons', () => {
    const { getByText } = renderWithProviders(<SubmissionFeedScreen />);
    expect(getByText('Newest')).toBeTruthy();
    expect(getByText('Top Rated')).toBeTruthy();
  });
});
