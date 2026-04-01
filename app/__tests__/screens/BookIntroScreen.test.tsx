import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import BookIntroScreen from '@/screens/BookIntroScreen';

// ── Override useRoute to supply params ───────────────────────────
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn() }),
    useRoute: () => ({ params: { bookId: 'genesis' }, key: 'BookIntro-1', name: 'BookIntro' }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      {},
      React.createElement(Text, {}, title),
      subtitle ? React.createElement(Text, {}, subtitle) : null,
    );
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, label);
  },
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseBookIntro = jest.fn();
jest.mock('@/hooks/useBookIntro', () => ({
  useBookIntro: (...args: unknown[]) => mockUseBookIntro(...args),
}));

const sampleIntro = {
  title: 'Genesis',
  subtitle: 'The Book of Beginnings',
  authorship: {
    author: 'Moses (traditional)',
    date: 'c. 1400 BC',
    prompt: 'To provide Israel with an account of origins.',
  },
  sections: [
    {
      heading: 'Literary Outline',
      content: null,
      body: null,
      outline: [
        { label: 'Primeval History', chapters: [1, 11], note: 'Creation through Babel' },
        { label: 'Patriarchal Narratives', chapters: [12, 50], note: 'Abraham through Joseph' },
      ],
      themes: null,
      plan: null,
    },
    {
      heading: 'Major Themes',
      content: null,
      body: null,
      outline: null,
      themes: ['Creation', 'Covenant', 'Fall', 'Promise'],
      plan: null,
    },
    {
      heading: 'Overview',
      content: 'Genesis sets the stage for the entire biblical narrative.',
      body: null,
      outline: null,
      themes: null,
      plan: null,
    },
  ],
  text: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBookIntro.mockReturnValue({
    intro: sampleIntro,
    isLoading: false,
  });
});

describe('BookIntroScreen', () => {
  it('renders book title and subtitle', () => {
    const { getByText } = renderWithProviders(<BookIntroScreen />);
    expect(getByText('Genesis')).toBeTruthy();
    expect(getByText('The Book of Beginnings')).toBeTruthy();
  });

  it('renders authorship section', () => {
    const { getByText } = renderWithProviders(<BookIntroScreen />);
    expect(getByText('AUTHORSHIP')).toBeTruthy();
    expect(getByText('Moses (traditional)')).toBeTruthy();
    expect(getByText('c. 1400 BC')).toBeTruthy();
  });

  it('renders sections with outline, themes, and content', () => {
    const { getByText } = renderWithProviders(<BookIntroScreen />);
    // Outline section
    expect(getByText('Literary Outline')).toBeTruthy();
    expect(getByText('Primeval History')).toBeTruthy();
    expect(getByText('Patriarchal Narratives')).toBeTruthy();
    // Themes section (rendered as BadgeChip)
    expect(getByText('Major Themes')).toBeTruthy();
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('Covenant')).toBeTruthy();
    // Content section
    expect(getByText('Overview')).toBeTruthy();
    expect(getByText(/Genesis sets the stage/)).toBeTruthy();
  });

  it('renders loading state', () => {
    mockUseBookIntro.mockReturnValue({
      intro: null,
      isLoading: true,
    });
    const { getByText } = renderWithProviders(<BookIntroScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });
});
