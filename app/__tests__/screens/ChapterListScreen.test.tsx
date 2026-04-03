import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ChapterListScreen from '@/screens/ChapterListScreen';

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
    useRoute: () => ({ params: { bookId: 'genesis' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(React.Fragment, null,
      React.createElement(Text, {}, title),
      subtitle ? React.createElement(Text, {}, subtitle) : null,
    );
  },
}));

// ── DB mocks ────────────────────────────────────────────────────
jest.mock('@/db/content', () => ({
  getBook: jest.fn().mockResolvedValue({
    id: 'genesis',
    name: 'Genesis',
    testament: 'ot',
    total_chapters: 50,
    book_order: 1,
    is_live: true,
  }),
  getDifficultyForBook: jest.fn().mockResolvedValue(new Map()),
}));

jest.mock('@/db/user', () => ({
  getProgressForBook: jest.fn().mockResolvedValue([
    { chapter_num: 1 },
    { chapter_num: 2 },
  ]),
}));

// ── Tests ─────────────────────────────────────────────────────────
describe('ChapterListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { toJSON } = renderWithProviders(<ChapterListScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the book name and chapter count after loading', async () => {
    const { findByText } = renderWithProviders(<ChapterListScreen />);
    expect(await findByText('Genesis')).toBeTruthy();
    expect(await findByText('50 chapters')).toBeTruthy();
  });

  it('renders About This Book link', async () => {
    const { findByText } = renderWithProviders(<ChapterListScreen />);
    expect(await findByText('About This Book')).toBeTruthy();
  });

  it('renders chapter number cells', async () => {
    const { findByText } = renderWithProviders(<ChapterListScreen />);
    expect(await findByText('1')).toBeTruthy();
    expect(await findByText('50')).toBeTruthy();
  });

  it('navigates to BookIntro when About This Book is tapped', async () => {
    const { findByText } = renderWithProviders(<ChapterListScreen />);
    const link = await findByText('About This Book');
    fireEvent.press(link);
    expect(mockNavigate).toHaveBeenCalledWith('BookIntro', { bookId: 'genesis' });
  });
});
