import React from 'react';
import { Text } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DictionaryDetailScreen from '@/screens/DictionaryDetailScreen';

// ── Navigation + route mock ──────────────────────────────────────
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
    useRoute: () => ({ params: { entryId: 'aaron' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock detail hook ─────────────────────────────────────────────
jest.mock('@/hooks/useDictionary', () => ({
  useDictionaryDetail: () => ({
    entry: {
      id: 'aaron',
      term: 'Aaron',
      definition: 'Brother of Moses and first high priest.',
      refs: ['Ex 4:14'],
      related: ['moses'],
      category: 'people',
      crossLinks: {
        personId: 'aaron',
        placeId: null,
        wordStudyId: null,
        conceptId: null,
      },
      source: 'easton',
    },
    isLoading: false,
  }),
  useDictionaryBrowse: jest.fn(),
}));

// ── Icon mock ────────────────────────────────────────────────────
jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Search: () => null,
  X: () => null,
}));

// ── Safe area mock ──────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// ── Ref detector mock ───────────────────────────────────────────
jest.mock('@/utils/refDetector', () => ({
  splitTextWithRefs: (text: string) => [{ type: 'text', value: text }],
}));

// ── Component mocks ─────────────────────────────────────────────
jest.mock('@/components/DictionaryCrossLink', () => ({
  DictionaryCrossLink: (props: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText>DictionaryCrossLink</RNText>;
  },
}));

jest.mock('@/components/TappableRefs', () => ({
  TappableRefs: (props: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText>TappableRefs</RNText>;
  },
}));

// ── Tests ─────────────────────────────────────────────────────────
describe('DictionaryDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders entry term "Aaron"', () => {
    const { getByText } = renderWithProviders(<DictionaryDetailScreen />);
    expect(getByText('Aaron')).toBeTruthy();
  });

  it('renders definition text', () => {
    const { getByText } = renderWithProviders(<DictionaryDetailScreen />);
    expect(getByText('Brother of Moses and first high priest.')).toBeTruthy();
  });

  it('renders "REFERENCES" section', () => {
    const { getByText } = renderWithProviders(<DictionaryDetailScreen />);
    expect(getByText('REFERENCES')).toBeTruthy();
  });

  it('renders "RELATED ENTRIES" section', () => {
    const { getByText } = renderWithProviders(<DictionaryDetailScreen />);
    expect(getByText('RELATED ENTRIES')).toBeTruthy();
  });

  it('shows attribution text "Easton\'s Bible Dictionary"', () => {
    const { getByText } = renderWithProviders(<DictionaryDetailScreen />);
    expect(getByText(/Easton's Bible Dictionary/)).toBeTruthy();
  });
});
