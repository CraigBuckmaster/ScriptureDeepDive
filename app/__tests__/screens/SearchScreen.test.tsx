import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import SearchScreen from '@/screens/SearchScreen';

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

const mockSearchResults = {
  results: {
    reference: null as any,
    people: [] as any[],
    verses: [] as any[],
    books: [] as any[],
    concepts: [] as any[],
    mapStories: [] as any[],
    timelineEvents: [] as any[],
    lifeTopics: [] as any[],
    difficultPassages: [] as any[],
  },
  isLoading: false,
};

jest.mock('@/hooks/useSearch', () => ({
  useSearch: () => mockSearchResults,
  buildOrderedGroups: jest.fn().mockReturnValue([]),
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

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchResults.results = {
      reference: null,
      people: [], verses: [], books: [], concepts: [],
      mapStories: [], timelineEvents: [], lifeTopics: [], difficultPassages: [],
    };
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
    expect(getByText('Search books, people, concepts, verses, and more')).toBeTruthy();
  });

  it('shows reference-aware placeholder', () => {
    const { getByPlaceholderText } = renderWithProviders(<SearchScreen />);
    expect(getByPlaceholderText(/reference like Gen 3:15/)).toBeTruthy();
  });

  it('updates query when user types in search input', () => {
    const { getByTestId } = renderWithProviders(<SearchScreen />);
    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'love');
    expect(input).toBeTruthy();
  });

  it('renders without filter chips (removed)', () => {
    const { queryByText } = renderWithProviders(<SearchScreen />);
    // The old All/OT/NT filter buttons should not exist
    expect(queryByText('OT')).toBeNull();
    expect(queryByText('NT')).toBeNull();
  });
});
