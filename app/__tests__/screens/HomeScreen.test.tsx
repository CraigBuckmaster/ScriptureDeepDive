import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import HomeScreen from '@/screens/HomeScreen';

// ── Mocks ─────────────────────────────────────────────────────────

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

const mockHomeData = {
  greeting: 'Good morning',
  subtitle: '5-day reading streak',
  verse: {
    ref: 'John 3:16',
    bookId: 'john',
    chapter: 3,
    text: 'For God so loved the world...',
  },
  recentChapters: [] as any[],
  readingStats: null as any,
  isLoading: false,
  refresh: jest.fn(),
};

jest.mock('@/hooks/useHomeData', () => ({
  useHomeData: () => mockHomeData,
}));

jest.mock('@/hooks/useStreakData', () => ({
  useStreakData: () => ({
    currentStreak: 5,
    weeklyChapters: 3,
    weeklyBookNames: ['Genesis', 'Exodus'],
    pendingMilestone: null,
    markMilestoneSeen: jest.fn(),
  }),
}));

jest.mock('@/hooks/useRecommendations', () => ({
  useRecommendations: () => [],
}));

jest.mock('@/stores', () => ({
  useSettingsStore: (sel: any) => sel({
    translation: 'niv',
    fontSize: 16,
    bookListMode: 'canonical',
    studyCoachEnabled: true,
  }),
}));

// Stub child components with complex deps
jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => 'LoadingSkeleton',
}));

jest.mock('@/components/StreakBadge', () => ({
  StreakBadge: ({ streak }: { streak: number }) => `StreakBadge-${streak}`,
}));

jest.mock('@/components/WeeklySummary', () => ({
  WeeklySummary: () => 'WeeklySummary',
}));

jest.mock('@/components/MilestoneToast', () => ({
  MilestoneToast: () => null,
}));

jest.mock('@/utils/shareVerse', () => ({
  shareVerse: jest.fn(),
}));

// ── Tests ─────────────────────────────────────────────────────────

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHomeData.isLoading = false;
    mockHomeData.recentChapters = [];
    mockHomeData.readingStats = null;
  });

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows loading skeleton when isLoading is true', () => {
    mockHomeData.isLoading = true;
    const { toJSON } = renderWithProviders(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('displays greeting text', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('Good morning')).toBeTruthy();
  });

  it('displays subtitle text', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('5-day reading streak')).toBeTruthy();
  });

  it('displays "Begin Your Journey" when no recent chapters', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('Begin Your Journey')).toBeTruthy();
    expect(getByText('Genesis 1')).toBeTruthy();
  });

  it('displays "Continue Reading" card when recent chapters exist', () => {
    mockHomeData.recentChapters = [
      { book_id: 'genesis', chapter_num: 3, book_name: 'Genesis', title: 'The Fall', completed_at: '2024-01-01' },
    ];
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText(/Genesis · Chapter 3/)).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('navigates to chapter when Continue card is pressed', () => {
    mockHomeData.recentChapters = [
      { book_id: 'genesis', chapter_num: 3, book_name: 'Genesis', title: 'The Fall', completed_at: '2024-01-01' },
    ];
    const { getByText } = renderWithProviders(<HomeScreen />);
    fireEvent.press(getByText('Continue'));
    expect(mockNavigate).toHaveBeenCalledWith('Chapter', { bookId: 'genesis', chapterNum: 3 });
  });

  it('displays verse of the day', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('VERSE OF THE DAY')).toBeTruthy();
    expect(getByText('John 3:16')).toBeTruthy();
    expect(getByText('For God so loved the world...')).toBeTruthy();
  });

  it('navigates to chapter when verse of the day is pressed', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    fireEvent.press(getByText('For God so loved the world...'));
    expect(mockNavigate).toHaveBeenCalledWith('Chapter', { bookId: 'john', chapterNum: 3 });
  });

  it('shows Explore section when no recommendations', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('EXPLORE')).toBeTruthy();
    expect(getByText('People')).toBeTruthy();
    expect(getByText('Timeline')).toBeTruthy();
  });

  it('shows progress bar when chapters have been read', () => {
    mockHomeData.readingStats = { totalChapters: 100, currentStreak: 5, longestStreak: 10 };
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('100 of 1189 chapters')).toBeTruthy();
    expect(getByText('8.4%')).toBeTruthy();
  });

  it('does not show progress bar when no chapters read', () => {
    mockHomeData.readingStats = null;
    const { queryByText } = renderWithProviders(<HomeScreen />);
    expect(queryByText(/of 1189 chapters/)).toBeNull();
  });
});
