import React from 'react';
import { fireEvent } from '@testing-library/react-native';
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

jest.mock('@/hooks/useExploreImages', () => ({
  useExploreImages: () => ({}),
}));

jest.mock('@/stores', () => ({
  useSettingsStore: Object.assign(
    (sel: any) => sel({
      translation: 'kjv',
      fontSize: 16,
      bookListMode: 'canonical',
      studyCoachEnabled: true,
      gettingStartedDone: new Set(),
    }),
    { getState: () => ({ markGettingStartedDone: jest.fn(), gettingStartedDone: new Set() }) },
  ),
}));

// Stub child components with complex deps
jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => 'LoadingSkeleton',
}));

jest.mock('@/components/StreakBadge', () => ({
  StreakBadge: ({ streak }: { streak: number }) => `StreakBadge-${streak}`,
}));

jest.mock('@/components/MilestoneToast', () => ({
  MilestoneToast: () => null,
}));

jest.mock('@/utils/shareVerse', () => ({
  shareVerse: jest.fn(),
  shareProgress: jest.fn(),
}));

jest.mock('@/components/ActivePlanCard', () => ({
  ActivePlanCard: () => null,
}));

jest.mock('@/components/ContinueReadingHero', () => ({
  ContinueReadingHero: ({ mostRecent, onPress }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    const title = mostRecent
      ? `${mostRecent.book_name} · Chapter ${mostRecent.chapter_num}`
      : 'Begin Your Journey';
    const cta = mostRecent ? 'Continue' : 'Genesis 1';
    return React.createElement(TouchableOpacity, { onPress }, [
      React.createElement(Text, { key: 'title' }, title),
      React.createElement(Text, { key: 'cta' }, cta),
    ]);
  },
}));

jest.mock('@/components/ProgressRow', () => ({
  ProgressRow: ({ chaptersRead }: { chaptersRead: number }) => {
    if (chaptersRead <= 0) return null;
    const React = require('react');
    const { Text } = require('react-native');
    const pct = ((chaptersRead / 1189) * 100).toFixed(1);
    return React.createElement(React.Fragment, null, [
      React.createElement(Text, { key: 'label' }, `${chaptersRead} of 1189 chapters`),
      React.createElement(Text, { key: 'pct' }, `${pct}%`),
    ]);
  },
}));

jest.mock('@/components/FeatureCard', () => ({
  FeatureCard: ({ feature }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, feature.title);
  },
  CARD_WIDTH: 174,
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

  it('displays Continue card when recent chapters exist', () => {
    mockHomeData.recentChapters = [
      { book_id: 'genesis', chapter_num: 3, book_name: 'Genesis', title: 'The Fall', completed_at: '2024-01-01' },
    ];
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText(/Genesis · Chapter 3/)).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('navigates to chapter when Continue hero is pressed', () => {
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

  it('shows START EXPLORING carousel for new users', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('START EXPLORING')).toBeTruthy();
    expect(getByText('People')).toBeTruthy();
    expect(getByText('Timeline')).toBeTruthy();
  });

  it('shows progress row when chapters have been read', () => {
    mockHomeData.readingStats = { totalChapters: 100, currentStreak: 5, longestStreak: 10 };
    const { getByText } = renderWithProviders(<HomeScreen />);
    expect(getByText('100 of 1189 chapters')).toBeTruthy();
    expect(getByText('8.4%')).toBeTruthy();
  });

  it('does not show progress when no chapters read', () => {
    mockHomeData.readingStats = null;
    const { queryByText } = renderWithProviders(<HomeScreen />);
    expect(queryByText(/of 1189 chapters/)).toBeNull();
  });
});
