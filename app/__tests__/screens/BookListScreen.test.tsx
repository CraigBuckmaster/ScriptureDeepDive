import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import BookListScreen from '@/screens/BookListScreen';

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

// ── Hooks ─────────────────────────────────────────────────────────

const sampleBooks = [
  { id: 'genesis', name: 'Genesis', testament: 'ot', total_chapters: 50, book_order: 1, is_live: true, chaptersRead: 5, genre_label: null, genre_guidance: null },
  { id: 'exodus', name: 'Exodus', testament: 'ot', total_chapters: 40, book_order: 2, is_live: true, chaptersRead: 0, genre_label: null, genre_guidance: null },
  { id: 'matthew', name: 'Matthew', testament: 'nt', total_chapters: 28, book_order: 40, is_live: true, chaptersRead: 3, genre_label: null, genre_guidance: null },
  { id: 'mark', name: 'Mark', testament: 'nt', total_chapters: 16, book_order: 41, is_live: true, chaptersRead: 0, genre_label: null, genre_guidance: null },
];

jest.mock('@/hooks/useBooks', () => ({
  useBooks: () => ({ books: sampleBooks, liveBooks: sampleBooks, isLoading: false }),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({
    bookListMode: 'canonical',
    setBookListMode: jest.fn(),
  }),
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: (props: any) => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return React.createElement(TextInput, {
      testID: 'book-search-input',
      value: props.value,
      onChangeText: props.onChangeText,
      placeholder: props.placeholder,
    });
  },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('BookListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<BookListScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Library heading', () => {
    const { getByText } = renderWithProviders(<BookListScreen />);
    expect(getByText('Library')).toBeTruthy();
  });

  it('renders OT/NT toggle in canonical mode', () => {
    const { getByText } = renderWithProviders(<BookListScreen />);
    expect(getByText('Old Testament')).toBeTruthy();
    expect(getByText('New Testament')).toBeTruthy();
  });

  it('renders OT books by default', () => {
    const { getByText } = renderWithProviders(<BookListScreen />);
    expect(getByText('Genesis')).toBeTruthy();
    expect(getByText('Exodus')).toBeTruthy();
  });

  it('switches to NT books when New Testament toggle is pressed', () => {
    const { getByText, queryByText } = renderWithProviders(<BookListScreen />);
    fireEvent.press(getByText('New Testament'));
    expect(getByText('Matthew')).toBeTruthy();
    expect(getByText('Mark')).toBeTruthy();
  });

  it('filters books when search input is used', () => {
    const { getByTestId, getByText, queryByText } = renderWithProviders(<BookListScreen />);
    fireEvent.changeText(getByTestId('book-search-input'), 'gene');
    expect(getByText('Genesis')).toBeTruthy();
    expect(queryByText('Exodus')).toBeNull();
  });

  it('shows empty state when search has no matches', () => {
    const { getByTestId, getByText } = renderWithProviders(<BookListScreen />);
    fireEvent.changeText(getByTestId('book-search-input'), 'zzzzz');
    expect(getByText(/No books matching/)).toBeTruthy();
  });

  it('navigates to ChapterList when a book is tapped', () => {
    const { getByText } = renderWithProviders(<BookListScreen />);
    fireEvent.press(getByText('Genesis'));
    expect(mockNavigate).toHaveBeenCalledWith('ChapterList', { bookId: 'genesis' });
  });
});
