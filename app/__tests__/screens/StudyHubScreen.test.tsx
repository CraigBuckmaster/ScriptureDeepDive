/**
 * #1832 — StudyHubScreen: hero (with plan / hidden without), review
 * cycling, rhythm line, and library shelves on the flag-on root.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { GuidedReviewItem, StudyPlan, StudyPlanItem } from '@/types';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn(), push: jest.fn() }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(), // same behavior as the global jest.setup mock
  };
});

// ── Library shelf data mocks (same set as ExploreMenuScreen.test) ──
jest.mock('@/db/content', () => ({
  getAllProphecyChains: jest.fn().mockResolvedValue([]),
  getDebateTopics: jest.fn().mockResolvedValue([]),
  getAllWordStudies: jest.fn().mockResolvedValue([]),
  getLifeTopicCategories: jest.fn().mockResolvedValue([]),
  getPeopleWithJourneys: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/hooks/useJourneyBrowse', () => ({
  useJourneyBrowse: jest.fn().mockReturnValue({
    allJourneys: [], personJourneys: [], conceptJourneys: [], thematicJourneys: [],
    lensIds: [], isLoading: false,
  }),
}));
jest.mock('@/hooks/useProphecyChains', () => ({
  useProphecyChains: jest.fn().mockReturnValue({ chains: [], isLoading: false }),
}));
jest.mock('@/hooks/useExploreImages', () => ({
  useExploreImages: jest.fn().mockReturnValue({}),
}));
jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: true, upgradeRequest: null, showUpgrade: jest.fn(), dismissUpgrade: jest.fn(),
  }),
}));
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(true),
}));

// ── Hub data mocks ──
const mockUseContinuePlan = jest.fn();
jest.mock('@/hooks/useContinuePlan', () => ({
  useContinuePlan: () => mockUseContinuePlan(),
}));

const mockCompleteItem = jest.fn().mockResolvedValue(undefined);
const mockUseReviewQueue = jest.fn();
jest.mock('@/hooks/useReviewQueue', () => ({
  useReviewQueue: () => mockUseReviewQueue(),
}));

const RHYTHM = [{ week: '2026-W27', weekStart: '2026-06-29', sessions: 2, reviews: 1 }];
jest.mock('@/services/study', () => ({
  getWeeklyRhythm: jest.fn().mockResolvedValue(RHYTHM),
}));

import StudyHubScreen from '@/screens/StudyHubScreen';

const PLAN: StudyPlan = {
  id: 'plan-1',
  plan_type: 'book',
  source_id: 'jonah',
  title: 'Jonah',
  default_mode: 'quick',
  created_at: '2026-06-01 00:00:00',
  archived_at: null,
};

const ITEMS: StudyPlanItem[] = [1, 2, 3].map((n) => ({
  plan_id: 'plan-1',
  item_num: n,
  kind: 'session',
  ref_json: JSON.stringify({ bookId: 'jonah', chapterNum: n }),
  session_id: null,
  completed_at: n === 1 ? '2026-06-02 08:00:00' : null,
}));

function reviewItem(id: number, prompt: string): GuidedReviewItem {
  return {
    id,
    source_session_id: 10 + id,
    chapter_id: 'jonah_1',
    title: 'Jonah 1',
    prompt,
    answer: 'answer',
    due_date: '2026-07-01',
    interval_days: 3,
    review_count: 0,
    status: 'due',
    created_at: '2026-06-28 08:00:00',
    updated_at: '2026-06-28 08:00:00',
  } as GuidedReviewItem;
}

function stubReviewQueue(dueItems: GuidedReviewItem[]) {
  mockUseReviewQueue.mockReturnValue({
    dueItems,
    completeItem: mockCompleteItem,
    reload: jest.fn().mockResolvedValue(undefined),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseContinuePlan.mockReturnValue({
    plan: PLAN,
    items: ITEMS,
    target: { bookId: 'jonah', chapterNum: 2, step: 'explore' },
    estimateMin: 12,
    isLoading: false,
    reload: jest.fn().mockResolvedValue(undefined),
  });
  stubReviewQueue([reviewItem(1, 'What did the storm reveal?')]);
});

describe('StudyHubScreen (#1832)', () => {
  it('renders heading, hero, review, rhythm, and library shelves', async () => {
    const { getByText } = render(<StudyHubScreen />);
    expect(getByText('Study')).toBeTruthy();
    expect(getByText('Jonah')).toBeTruthy();
    expect(getByText('Jonah 2 · Paused at Explore · ~12 min')).toBeTruthy();
    expect(getByText('What did the storm reveal?')).toBeTruthy();
    await waitFor(() => {
      expect(getByText('Two sessions and one review this week — a steady rhythm of study.')).toBeTruthy();
      expect(getByText('The Biblical World')).toBeTruthy();
      expect(getByText('Deep Dive')).toBeTruthy();
    });
  });

  it('resumes the plan into StudySession with the paused step', async () => {
    const { getByLabelText } = render(<StudyHubScreen />);
    fireEvent.press(getByLabelText('Resume Jonah at Jonah 2'));
    expect(mockNavigate).toHaveBeenCalledWith('StudySession', {
      bookId: 'jonah',
      chapterNum: 2,
      initialStep: 'explore',
    });
  });

  it('renders no hero region when there is no active plan', async () => {
    mockUseContinuePlan.mockReturnValue({
      plan: null, items: [], target: null, estimateMin: null,
      isLoading: false, reload: jest.fn().mockResolvedValue(undefined),
    });
    const { queryByText, getByText } = render(<StudyHubScreen />);
    expect(queryByText('CONTINUE')).toBeNull();
    expect(queryByText('Resume')).toBeNull();
    // The rest of the hub still renders.
    await waitFor(() => expect(getByText('The Biblical World')).toBeTruthy());
  });

  it('completes the current review on "Recall it"', async () => {
    const { getByLabelText } = render(<StudyHubScreen />);
    fireEvent.press(getByLabelText('Recall it — mark this review complete'));
    await waitFor(() => expect(mockCompleteItem).toHaveBeenCalledWith(1));
  });

  it('cycles to the next due item on "Later"', async () => {
    stubReviewQueue([
      reviewItem(1, 'What did the storm reveal?'),
      reviewItem(2, 'Why did Jonah flee?'),
    ]);
    const { getByLabelText, getByText, queryByText } = render(<StudyHubScreen />);
    expect(getByText('What did the storm reveal?')).toBeTruthy();
    expect(getByText('Jonah 1  ·  1 of 2 due')).toBeTruthy();

    fireEvent.press(getByLabelText('Later — show the next due review'));
    expect(getByText('Why did Jonah flee?')).toBeTruthy();
    expect(queryByText('What did the storm reveal?')).toBeNull();

    // Wraps back around.
    fireEvent.press(getByLabelText('Later — show the next due review'));
    expect(getByText('What did the storm reveal?')).toBeTruthy();
  });

  it('shows no review card when nothing is due', () => {
    stubReviewQueue([]);
    const { queryByText } = render(<StudyHubScreen />);
    expect(queryByText('Recall it')).toBeNull();
  });
});
