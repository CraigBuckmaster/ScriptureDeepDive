import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ConcordanceScreen from '@/screens/ConcordanceScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: jest.fn().mockReturnValue({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── DB mocks ──────────────────────────────────────────────────────

const mockGetConcordanceResults = jest.fn().mockResolvedValue([]);
const mockGetConcordanceCount = jest.fn().mockResolvedValue(0);

jest.mock('@/db/content', () => ({
  getConcordanceResults: (...args: any[]) => mockGetConcordanceResults(...args),
  getConcordanceCount: (...args: any[]) => mockGetConcordanceCount(...args),
}));

// Stub child components
jest.mock('@/components/ConcordanceEntry', () => ({
  ConcordanceEntry: (props: any) => {
    const React = require('react');
    const { Text, TouchableOpacity } = require('react-native');
    return React.createElement(TouchableOpacity, { onPress: props.onPress },
      React.createElement(Text, null, `${props.result.book_name} ${props.result.chapter_num}:${props.result.verse_num}`),
    );
  },
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'screen-header' }, props.title);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'loading-skeleton' }, 'Loading...');
  },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('ConcordanceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRoute as jest.Mock).mockReturnValue({ params: {} });
    mockGetConcordanceResults.mockResolvedValue([]);
    mockGetConcordanceCount.mockResolvedValue(0);
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ConcordanceScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders search input placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<ConcordanceScreen />);
    expect(getByPlaceholderText("Enter Strong's number (e.g. H2617)")).toBeTruthy();
  });

  it('renders the Concordance header', () => {
    const { getByTestId } = renderWithProviders(<ConcordanceScreen />);
    expect(getByTestId('screen-header')).toBeTruthy();
  });

  it('shows initial empty state when no params', () => {
    const { getByText } = renderWithProviders(<ConcordanceScreen />);
    expect(getByText(/Find every verse where a Hebrew or Greek word appears/)).toBeTruthy();
  });

  it('shows word info header when params provided', () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: {
        strongs: 'H2617',
        original: '\u05D7\u05B6\u05E1\u05B6\u05D3',
        transliteration: 'chesed',
        gloss: 'steadfast love',
      },
    });
    const { getByText } = renderWithProviders(<ConcordanceScreen />);
    expect(getByText('\u05D7\u05B6\u05E1\u05B6\u05D3')).toBeTruthy();
    expect(getByText('chesed')).toBeTruthy();
    expect(getByText('H2617')).toBeTruthy();
  });

  it('shows empty results state after search with no matches', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { strongs: 'H9999' },
    });
    mockGetConcordanceResults.mockResolvedValue([]);
    mockGetConcordanceCount.mockResolvedValue(0);

    const { findByText } = renderWithProviders(<ConcordanceScreen />);
    expect(await findByText(/No results found for H9999/)).toBeTruthy();
  });

  it('renders concordance results when data available', async () => {
    (useRoute as jest.Mock).mockReturnValue({
      params: { strongs: 'H2617', original: '\u05D7\u05B6\u05E1\u05B6\u05D3', transliteration: 'chesed', gloss: 'steadfast love' },
    });
    mockGetConcordanceResults.mockResolvedValue([
      { book_id: 'genesis', chapter_num: 24, verse_num: 12, original: '\u05D7\u05B6\u05E1\u05B6\u05D3', transliteration: 'chesed', gloss: 'steadfast love', text: 'Show kindness...', book_name: 'Genesis' },
      { book_id: 'psalms', chapter_num: 23, verse_num: 6, original: '\u05D7\u05B6\u05E1\u05B6\u05D3', transliteration: 'chesed', gloss: 'steadfast love', text: 'Surely goodness and mercy...', book_name: 'Psalms' },
    ]);
    mockGetConcordanceCount.mockResolvedValue(2);

    const { findByText } = renderWithProviders(<ConcordanceScreen />);
    expect(await findByText('Genesis 24:12')).toBeTruthy();
    expect(await findByText('Psalms 23:6')).toBeTruthy();
  });

  it('renders Search button', () => {
    const { getByText } = renderWithProviders(<ConcordanceScreen />);
    expect(getByText('Search')).toBeTruthy();
  });
});
