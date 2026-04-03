import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DictionaryBrowseScreen from '@/screens/DictionaryBrowseScreen';

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
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock hook ────────────────────────────────────────────────────
jest.mock('@/hooks/useDictionary', () => ({
  useDictionaryBrowse: () => ({
    sections: [
      {
        letter: 'A',
        data: [
          {
            id: 'aaron',
            term: 'Aaron',
            definition: 'Brother of Moses',
            refs: [],
            related: [],
            category: 'people',
            crossLinks: {
              personId: 'aaron',
              placeId: null,
              wordStudyId: null,
              conceptId: null,
            },
            source: 'easton',
          },
        ],
      },
    ],
    availableLetters: new Set(['A']),
    isLoading: false,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    searchResults: null,
  }),
}));

// ── Icon mock ────────────────────────────────────────────────────
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  ChevronLeft: () => null,
  Search: () => null,
  X: () => null,
}));

// ── Safe area mock ──────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// ── Tests ─────────────────────────────────────────────────────────
describe('DictionaryBrowseScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Bible Dictionary" title', () => {
    const { getByText } = renderWithProviders(<DictionaryBrowseScreen />);
    expect(getByText('Bible Dictionary')).toBeTruthy();
  });

  it('renders entry term "Aaron"', () => {
    const { getByText } = renderWithProviders(<DictionaryBrowseScreen />);
    expect(getByText('Aaron')).toBeTruthy();
  });

  it('shows CS badge for entries with cross-links', () => {
    const { getByText } = renderWithProviders(<DictionaryBrowseScreen />);
    expect(getByText('CS')).toBeTruthy();
  });
});
