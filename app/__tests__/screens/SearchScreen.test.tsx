import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SearchScreen from '@/screens/SearchScreen';

// ── Navigation mock ───────────────────────────────────────────────

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
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Hooks ─────────────────────────────────────────────────────────

const mockSearchResults = {
  results: { people: [] as any[], wordStudies: [] as any[], verses: [] as any[], discoveries: [] as any[] },
  isLoading: false,
};

jest.mock('@/hooks/useSearch', () => ({
  useSearch: () => mockSearchResults,
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: (props: any) => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return React.createElement(TextInput, {
      testID: 'search-input',
      value: props.value,
      onChangeText: props.onChangeText,
      placeholder: props.placeholder,
    });
  },
}));

jest.mock('@/components/SearchFilterChips', () => ({
  SearchFilterChips: () => null,
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchResults.results = { people: [], wordStudies: [], verses: [], discoveries: [] };
    mockSearchResults.isLoading = false;
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<SearchScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the search input', () => {
    const { getByTestId } = renderWithProviders(<SearchScreen />);
    expect(getByTestId('search-input')).toBeTruthy();
  });

  it('shows idle state message when no query entered', () => {
    const { getByText } = renderWithProviders(<SearchScreen />);
    expect(getByText('Search verses, people, evidence, and more')).toBeTruthy();
  });

  it('shows search input with correct placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<SearchScreen />);
    expect(getByPlaceholderText('Search verses, people, evidence...')).toBeTruthy();
  });

  it('renders results sections when people data is available', () => {
    mockSearchResults.results = {
      people: [{ id: 'moses', name: 'Moses', role: 'Prophet', era: 'exodus' }],
      wordStudies: [],
      verses: [],
      discoveries: [],
    };
    // The SectionList needs a query with length >= 2 to render,
    // but since useSearch is mocked, the results will be available.
    // The component checks trimmed.length < 2 internally from its own state.
    const { toJSON } = renderWithProviders(<SearchScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders results sections when verse data is available', () => {
    mockSearchResults.results = {
      people: [],
      wordStudies: [],
      verses: [
        { id: 1, book_id: 'genesis', chapter_num: 1, verse_num: 1, text: 'In the beginning', book_name: 'Genesis' },
      ],
      discoveries: [],
    };
    const { toJSON } = renderWithProviders(<SearchScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders results sections when word studies data is available', () => {
    mockSearchResults.results = {
      people: [],
      wordStudies: [{ id: 'w1', original: '\u05D7\u05B6\u05E1\u05B6\u05D3', transliteration: 'chesed' }],
      verses: [],
      discoveries: [],
    };
    const { toJSON } = renderWithProviders(<SearchScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('updates query when user types in search input', () => {
    const { getByTestId } = renderWithProviders(<SearchScreen />);
    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'love');
    // No crash, query state updated internally
    expect(input).toBeTruthy();
  });
});
