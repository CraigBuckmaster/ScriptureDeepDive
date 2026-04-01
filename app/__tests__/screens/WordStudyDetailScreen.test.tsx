import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useRoute } from '@react-navigation/native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import WordStudyDetailScreen from '@/screens/WordStudyDetailScreen';

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
    useRoute: jest.fn().mockReturnValue({
      params: { wordId: 'chesed-h2617' },
    }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── DB mocks ──────────────────────────────────────────────────────

const mockGetWordStudy = jest.fn();

jest.mock('@/db/content', () => ({
  getWordStudy: (...args: any[]) => mockGetWordStudy(...args),
}));

// Stub child components
jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `badge-${props.label}` }, props.label);
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

// ── Sample data ───────────────────────────────────────────────────

const sampleWord = {
  id: 'chesed-h2617',
  language: 'hebrew',
  original: '\u05D7\u05B6\u05E1\u05B6\u05D3',
  transliteration: 'chesed',
  strongs: 'H2617',
  glosses_json: '["steadfast love","mercy","kindness"]',
  semantic_range: 'Loyal, covenant-keeping love; faithfulness in relationship.',
  note: 'One of the most theologically rich words in the Hebrew Bible.',
  occurrences_json: JSON.stringify([
    { ref: 'Genesis 24:12', gloss: 'kindness', ctx: 'Show kindness to my master Abraham.' },
    { ref: 'Psalm 23:6', gloss: 'mercy', ctx: 'Surely goodness and mercy shall follow me.' },
  ]),
};

// ── Tests ─────────────────────────────────────────────────────────

describe('WordStudyDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWordStudy.mockResolvedValue(null);
    (useRoute as jest.Mock).mockReturnValue({
      params: { wordId: 'chesed-h2617' },
    });
  });

  it('renders loading skeleton when word data is not yet loaded', () => {
    const { getByTestId } = renderWithProviders(<WordStudyDetailScreen />);
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('renders word details when data loads', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByText('\u05D7\u05B6\u05E1\u05B6\u05D3')).toBeTruthy();
    expect(await findByText('chesed')).toBeTruthy();
    expect(await findByText("Strong's: H2617")).toBeTruthy();
  });

  it('displays glosses as badge chips', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByTestId } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByTestId('badge-steadfast love')).toBeTruthy();
    expect(await findByTestId('badge-mercy')).toBeTruthy();
    expect(await findByTestId('badge-kindness')).toBeTruthy();
  });

  it('displays concordance link button', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByText('See every occurrence in Scripture')).toBeTruthy();
  });

  it('navigates to Concordance when link is pressed', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    const link = await findByText('See every occurrence in Scripture');
    fireEvent.press(link);
    expect(mockNavigate).toHaveBeenCalledWith('Concordance', {
      strongs: 'H2617',
      original: '\u05D7\u05B6\u05E1\u05B6\u05D3',
      transliteration: 'chesed',
      gloss: 'steadfast love',
    });
  });

  it('renders occurrences list', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByText('KEY OCCURRENCES')).toBeTruthy();
    expect(await findByText('Show kindness to my master Abraham.')).toBeTruthy();
    expect(await findByText('Surely goodness and mercy shall follow me.')).toBeTruthy();
  });

  it('renders semantic range section', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByText('SEMANTIC RANGE')).toBeTruthy();
    expect(await findByText(/Loyal, covenant-keeping love/)).toBeTruthy();
  });

  it('renders theological note section', async () => {
    mockGetWordStudy.mockResolvedValue(sampleWord);
    const { findByText } = renderWithProviders(<WordStudyDetailScreen />);
    expect(await findByText('THEOLOGICAL NOTE')).toBeTruthy();
    expect(await findByText(/One of the most theologically rich words/)).toBeTruthy();
  });
});
