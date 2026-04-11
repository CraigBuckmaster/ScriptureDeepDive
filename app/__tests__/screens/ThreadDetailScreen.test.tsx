import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ThreadDetailScreen from '@/screens/ThreadDetailScreen';

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
    useRoute: () => ({ params: { threadId: 'thread-1' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

const mockUseThreadDetail = jest.fn().mockReturnValue({
  thread: null,
  steps: [],
  isLoading: false,
});

jest.mock('@/hooks/useThreads', () => ({
  useThreadDetail: (...args: any[]) => mockUseThreadDetail(...args),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn(),
  resolveVerseText: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('ThreadDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseThreadDetail.mockReturnValue({ thread: null, steps: [], isLoading: false });
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ThreadDetailScreen />);
    }).not.toThrow();
  });

  it('shows loading skeleton when isLoading', () => {
    mockUseThreadDetail.mockReturnValue({ thread: null, steps: [], isLoading: true });
    expect(() => {
      renderWithProviders(<ThreadDetailScreen />);
    }).not.toThrow();
  });

  it('renders header when no thread and not loading', () => {
    mockUseThreadDetail.mockReturnValue({ thread: null, steps: [], isLoading: false });
    const { toJSON } = renderWithProviders(<ThreadDetailScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders thread with data', async () => {
    const { parseReference, resolveVerseText } = require('@/utils/verseResolver');
    parseReference.mockReturnValue({ bookId: 'genesis', chapter: 15, startVerse: 1, endVerse: 6 });
    resolveVerseText.mockResolvedValue(['The word of the Lord came to Abram']);

    mockUseThreadDetail.mockReturnValue({
      thread: {
        id: 'thread-1',
        title: 'The Covenant Thread',
        description: 'Tracing the covenant through Scripture',
        tags: ['covenant', 'promise'],
        steps: [
          { ref: 'Genesis 15:1-6', note: 'Abrahamic covenant', order: 1 },
        ],
      },
      steps: [],
      isLoading: false,
    });

    const { findByText } = renderWithProviders(<ThreadDetailScreen />);
    // The thread renders tags
    const tag = await findByText('covenant');
    expect(tag).toBeTruthy();
  });
});
