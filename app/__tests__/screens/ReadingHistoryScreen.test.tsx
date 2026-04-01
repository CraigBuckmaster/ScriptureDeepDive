import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ReadingHistoryScreen from '@/screens/ReadingHistoryScreen';

// ── Navigation mock ───────────────────────────────────────────────

const mockPush = jest.fn();
const mockGoBack = jest.fn();

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

const mockGetRecentChapters = jest.fn().mockResolvedValue([]);
const mockGetReadingStats = jest.fn().mockResolvedValue(null);

jest.mock('@/db/user', () => ({
  getRecentChapters: (...args: any[]) => mockGetRecentChapters(...args),
  getReadingStats: (...args: any[]) => mockGetReadingStats(...args),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'screen-header' }, props.title);
  },
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('ReadingHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRecentChapters.mockResolvedValue([]);
    mockGetReadingStats.mockResolvedValue(null);
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ReadingHistoryScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the Reading History header', () => {
    const { getByText } = renderWithProviders(<ReadingHistoryScreen />);
    expect(getByText('Reading History')).toBeTruthy();
  });

  it('shows empty state when no history', async () => {
    const { findByText } = renderWithProviders(<ReadingHistoryScreen />);
    expect(await findByText('No reading history yet.')).toBeTruthy();
  });

  it('renders history items when data exists', async () => {
    mockGetRecentChapters.mockResolvedValue([
      { book_id: 'genesis', chapter_num: 1, book_name: 'Genesis', title: 'Creation', completed_at: '2024-01-15T10:00:00' },
      { book_id: 'exodus', chapter_num: 3, book_name: 'Exodus', title: 'Burning Bush', completed_at: '2024-01-14T09:00:00' },
    ]);
    const { findByText } = renderWithProviders(<ReadingHistoryScreen />);
    expect(await findByText('Genesis 1')).toBeTruthy();
    expect(await findByText('Exodus 3')).toBeTruthy();
  });

  it('displays stats when available', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 42,
      currentStreak: 7,
      longestStreak: 14,
    });
    const { findByText } = renderWithProviders(<ReadingHistoryScreen />);
    expect(await findByText('42')).toBeTruthy();
    expect(await findByText('Chapters')).toBeTruthy();
    expect(await findByText('7')).toBeTruthy();
    expect(await findByText('Day streak')).toBeTruthy();
    expect(await findByText('14')).toBeTruthy();
    expect(await findByText('Best streak')).toBeTruthy();
  });

  it('does not display stats row when totalChapters is 0', async () => {
    mockGetReadingStats.mockResolvedValue({
      totalChapters: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
    const { queryByText } = renderWithProviders(<ReadingHistoryScreen />);
    // Wait for effect to resolve
    await new Promise((r) => setTimeout(r, 0));
    expect(queryByText('Chapters')).toBeNull();
  });

  it('navigates to chapter when history item is tapped', async () => {
    mockGetRecentChapters.mockResolvedValue([
      { book_id: 'genesis', chapter_num: 1, book_name: 'Genesis', title: 'Creation', completed_at: '2024-01-15T10:00:00' },
    ]);
    const { findByText } = renderWithProviders(<ReadingHistoryScreen />);
    const item = await findByText('Genesis 1');
    fireEvent.press(item);
    expect(mockPush).toHaveBeenCalledWith('Chapter', { bookId: 'genesis', chapterNum: 1 });
  });
});
