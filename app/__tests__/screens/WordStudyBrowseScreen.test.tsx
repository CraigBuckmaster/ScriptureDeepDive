import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import WordStudyBrowseScreen from '@/screens/WordStudyBrowseScreen';

// ── Navigation mock ───────────────────────────────────────────────
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: () => null,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseWordStudies = jest.fn();
jest.mock('@/hooks/useWordStudies', () => ({
  useWordStudies: (...args: unknown[]) => mockUseWordStudies(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const sampleStudies = [
  { id: 'w1', original: '\u03B1\u0313\u03B3\u03AC\u03C0\u03B7', transliteration: 'agape', language: 'greek', glosses_json: '["love","charity"]', strongs: 'G26' },
  { id: 'w2', original: '\u05D7\u05B6\u05E1\u05B6\u05D3', transliteration: 'chesed', language: 'hebrew', glosses_json: '["steadfast love","mercy"]', strongs: 'H2617' },
  { id: 'w3', original: '\u03C0\u03AF\u03C3\u03C4\u03B9\u03C2', transliteration: 'pistis', language: 'greek', glosses_json: '["faith","trust"]', strongs: 'G4102' },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseWordStudies.mockReturnValue({
    studies: sampleStudies,
    isLoading: false,
  });
});

// ── Tests ─────────────────────────────────────────────────────────
describe('WordStudyBrowseScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Word Studies header', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText('Word Studies')).toBeTruthy();
  });

  it('renders word transliterations', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText('agape')).toBeTruthy();
    expect(getByText('chesed')).toBeTruthy();
    expect(getByText('pistis')).toBeTruthy();
  });

  it('renders glosses for each word', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText('love, charity')).toBeTruthy();
    expect(getByText('steadfast love, mercy')).toBeTruthy();
  });

  it('renders Strongs numbers', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText("Strong's: G26")).toBeTruthy();
    expect(getByText("Strong's: H2617")).toBeTruthy();
  });

  it('renders language filter tabs', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Hebrew')).toBeTruthy();
    expect(getByText('Greek')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    mockUseWordStudies.mockReturnValue({ studies: [], isLoading: true });
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('navigates to WordStudyDetail on word tap', () => {
    const { getByText } = renderWithProviders(<WordStudyBrowseScreen />);
    fireEvent.press(getByText('agape'));
    expect(mockNavigate).toHaveBeenCalledWith('WordStudyDetail', { wordId: 'w1' });
  });
});
