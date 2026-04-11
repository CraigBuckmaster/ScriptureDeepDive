import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/hooks/useAsyncData', () => ({
  useAsyncData: jest.fn().mockReturnValue({
    data: {
      id: 'sub1',
      title: 'Grace in Romans',
      author_name: 'John Doe',
      body: 'The concept of grace pervades Paul\'s letter to the Romans...',
      upvote_count: 12,
      star_avg: 4.2,
      verses_json: '["Romans 3:23","Romans 6:23"]',
    },
    loading: false,
  }),
}));

jest.mock('@/hooks/useEngagement', () => ({
  useEngagement: jest.fn().mockReturnValue({
    isUpvoted: false,
    toggleUpvote: jest.fn(),
    rating: 0,
    setRating: jest.fn(),
  }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => null,
}));

jest.mock('@/components/engagement', () => ({
  EngagementBar: () => null,
}));

jest.mock('@/components/TrustBadge', () => {
  const RN = require('react-native');
  return {
    __esModule: true,
    default: () => <RN.Text>Trust</RN.Text>,
  };
});

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { submissionId: 'sub1' } }),
}));

import SubmissionDetailScreen from '@/screens/SubmissionDetailScreen';

describe('SubmissionDetailScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<SubmissionDetailScreen />);
    }).not.toThrow();
  });

  it('shows submission title', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Grace in Romans')).toBeTruthy();
  });

  it('shows author name', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('by John Doe')).toBeTruthy();
  });

  it('shows body text', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText(/concept of grace pervades/)).toBeTruthy();
  });

  it('shows trust badge', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Trust')).toBeTruthy();
  });

  it('shows verse references', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Romans 3:23')).toBeTruthy();
    expect(getByText('Romans 6:23')).toBeTruthy();
  });

  it('shows VERSES section label', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('VERSES')).toBeTruthy();
  });

  it('shows header title', () => {
    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Submission')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { useAsyncData } = require('@/hooks/useAsyncData');
    useAsyncData.mockReturnValue({ data: null, loading: true });

    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Submission')).toBeTruthy();
  });

  it('shows not found when data is null and not loading', () => {
    const { useAsyncData } = require('@/hooks/useAsyncData');
    useAsyncData.mockReturnValue({ data: null, loading: false });

    const { getByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(getByText('Submission not found')).toBeTruthy();
  });

  it('handles submission with no verses', () => {
    const { useAsyncData } = require('@/hooks/useAsyncData');
    useAsyncData.mockReturnValue({
      data: {
        id: 'sub2',
        title: 'No Verses',
        author_name: 'Jane',
        body: 'Short body',
        upvote_count: 0,
        star_avg: 0,
        verses_json: null,
      },
      loading: false,
    });

    const { queryByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(queryByText('VERSES')).toBeNull();
  });

  it('handles submission with invalid verses JSON', () => {
    const { useAsyncData } = require('@/hooks/useAsyncData');
    useAsyncData.mockReturnValue({
      data: {
        id: 'sub3',
        title: 'Bad JSON',
        author_name: 'Jane',
        body: 'Body',
        upvote_count: 0,
        star_avg: 0,
        verses_json: 'not json',
      },
      loading: false,
    });

    const { queryByText } = renderWithProviders(<SubmissionDetailScreen />);
    expect(queryByText('VERSES')).toBeNull();
  });
});
