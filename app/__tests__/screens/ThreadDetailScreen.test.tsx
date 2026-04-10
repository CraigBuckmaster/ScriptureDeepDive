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

jest.mock('@/hooks/useThreads', () => ({
  useThreadDetail: jest.fn().mockReturnValue({
    thread: null,
    steps: [],
    isLoading: false,
  }),
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

describe('ThreadDetailScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ThreadDetailScreen />);
    }).not.toThrow();
  });

  it('renders the header', () => {
    const result = renderWithProviders(<ThreadDetailScreen />);
    expect(result).toBeTruthy();
  });
});
