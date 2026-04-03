import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import BookmarkListScreen from '@/screens/BookmarkListScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockGoBack = jest.fn();
const mockPush = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: mockGoBack,
      push: mockPush,
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── DB mocks ──────────────────────────────────────────────────────

const mockGetBookmarks = jest.fn().mockResolvedValue([]);

jest.mock('@/db/user', () => ({
  getBookmarks: (...args: any[]) => mockGetBookmarks(...args),
  removeBookmark: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/verseRef', () => ({
  parseVerseRef: (ref: string) => {
    // Simple parser for test: "genesis_3:16" -> { bookId: 'genesis', ch: 3, v: 16 }
    const match = ref.match(/^(\w+[\w-]*)_(\d+):(\d+)$/);
    if (!match) return null;
    return { bookId: match[1], ch: parseInt(match[2]), v: parseInt(match[3]) };
  },
  displayRef: (ref: string) => ref.replace(/_/g, ' ').replace(/:/, ':'),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'screen-header' }, props.title);
  },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('BookmarkListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBookmarks.mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<BookmarkListScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Bookmarks header', async () => {
    const { getByText } = renderWithProviders(<BookmarkListScreen />);
    await waitFor(() => expect(getByText('Bookmarks')).toBeTruthy());
  });

  it('shows empty state when no bookmarks', async () => {
    const { findByText } = renderWithProviders(<BookmarkListScreen />);
    expect(await findByText(/No bookmarks yet/)).toBeTruthy();
  });

  it('renders bookmark list when bookmarks exist', async () => {
    mockGetBookmarks.mockResolvedValue([
      { id: 1, verse_ref: 'genesis_1:1', label: 'Creation', created_at: '2024-01-15T10:00:00' },
      { id: 2, verse_ref: 'john_3:16', label: null, created_at: '2024-02-20T14:30:00' },
    ]);
    const { findByText } = renderWithProviders(<BookmarkListScreen />);
    expect(await findByText('genesis 1:1')).toBeTruthy();
    expect(await findByText('john 3:16')).toBeTruthy();
  });

  it('navigates to chapter when bookmark is tapped', async () => {
    mockGetBookmarks.mockResolvedValue([
      { id: 1, verse_ref: 'genesis_1:1', label: 'Creation', created_at: '2024-01-15T10:00:00' },
    ]);
    const { findByText } = renderWithProviders(<BookmarkListScreen />);
    const bookmark = await findByText('genesis 1:1');
    fireEvent.press(bookmark);
    expect(mockPush).toHaveBeenCalledWith('Chapter', { bookId: 'genesis', chapterNum: 1 });
  });
});
