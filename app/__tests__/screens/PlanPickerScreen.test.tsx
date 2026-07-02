/**
 * #1833 — one-decision plan picker. Book segment ordering, the two-tap
 * acceptance path (segment card → book → session), zero mode prompt,
 * and topic filtering.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
let mockRouteParams: object | undefined = undefined;
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace, goBack: mockGoBack }),
    useRoute: () => ({ params: mockRouteParams }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/hooks', () => ({
  useBooks: jest.fn().mockReturnValue({
    liveBooks: [
      { id: 'genesis', name: 'Genesis', testament: 'ot', total_chapters: 50, book_order: 1, is_live: true, starter: 1 },
      { id: 'psalms', name: 'Psalms', testament: 'ot', total_chapters: 150, book_order: 19, is_live: true, starter: 1 },
      { id: 'romans', name: 'Romans', testament: 'nt', total_chapters: 16, book_order: 45, is_live: true, starter: 1 },
      { id: 'jude', name: 'Jude', testament: 'nt', total_chapters: 1, book_order: 65, is_live: true },
    ],
  }),
}));

const mockGetRecentChapters = jest.fn();
jest.mock('@/db/userQueries', () => ({
  getRecentChapters: (...args: unknown[]) => mockGetRecentChapters(...args),
}));

jest.mock('@/db/content', () => ({
  getTopics: jest.fn().mockResolvedValue([
    {
      id: 'covenant',
      title: 'Covenant',
      category: 'theology',
      relevant_chapters_json: JSON.stringify(['genesis_15', 'exodus_19']),
    },
    {
      id: 'empty-topic',
      title: 'Empty Topic',
      category: 'theology',
      relevant_chapters_json: '[]',
    },
  ]),
}));

jest.mock('@/db/content/features', () => ({
  getAllJourneys: jest.fn().mockResolvedValue([
    { id: 'covenant-journey', title: 'The Covenant', subtitle: 'From Noah to the New Covenant' },
  ]),
}));

const mockStartStudyPlan = jest.fn();
jest.mock('@/services/study', () => ({
  startStudyPlan: (...args: unknown[]) => mockStartStudyPlan(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import PlanPickerScreen from '@/screens/PlanPickerScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockRouteParams = undefined;
  mockGetRecentChapters.mockResolvedValue([
    { book_id: 'john', chapter_num: 3, completed_at: 'x', title: null, book_name: 'John' },
  ]);
  mockStartStudyPlan.mockResolvedValue({
    planId: 'plan-1',
    mode: 'deep',
    firstRef: { bookId: 'romans', chapterNum: 1 },
  });
});

describe('PlanPickerScreen (#1833)', () => {
  it('renders the book segment: continue row, starter shelf, testament groups — and no mode prompt', async () => {
    const { getByText, queryByText } = render(<PlanPickerScreen />);
    await waitFor(() => {
      expect(getByText("Continue where you're reading")).toBeTruthy();
      expect(getByText('John 3')).toBeTruthy();
      expect(getByText('GOOD PLACES TO BEGIN')).toBeTruthy();
      expect(getByText('OLD TESTAMENT')).toBeTruthy();
      expect(getByText('NEW TESTAMENT')).toBeTruthy();
      expect(getByText('Jude')).toBeTruthy();
    });
    // Mode is NOT asked — no mode selector labels anywhere.
    expect(queryByText('Quick pass')).toBeNull();
    expect(queryByText('Deep study')).toBeNull();
    expect(queryByText('Teaching prep')).toBeNull();
    expect(queryByText('Devotional')).toBeNull();
  });

  it('tapping Romans creates the plan and replaces to StudySession item 1 (one decision)', async () => {
    // Romans appears on the starter shelf AND in the NT group — press the shelf card.
    const { getAllByLabelText } = render(<PlanPickerScreen />);
    await waitFor(() => expect(getAllByLabelText('Study Romans').length).toBeGreaterThan(0));

    fireEvent.press(getAllByLabelText('Study Romans')[0]);

    await waitFor(() => {
      expect(mockStartStudyPlan).toHaveBeenCalledWith({
        planType: 'book',
        sourceId: 'romans',
        title: 'Romans',
      });
      expect(mockReplace).toHaveBeenCalledWith('StudySession', {
        bookId: 'romans',
        chapterNum: 1,
        planId: 'plan-1',
      });
    });
  });

  it('the continue row opens the session at the reading chapter, not item 1', async () => {
    mockStartStudyPlan.mockResolvedValue({
      planId: 'plan-john',
      mode: 'deep',
      firstRef: { bookId: 'john', chapterNum: 1 },
    });
    const { getByLabelText } = render(<PlanPickerScreen />);
    await waitFor(() =>
      expect(getByLabelText("Study Continue where you're reading")).toBeTruthy(),
    );

    fireEvent.press(getByLabelText("Study Continue where you're reading"));

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('StudySession', {
        bookId: 'john',
        chapterNum: 3,
        planId: 'plan-john',
      }),
    );
  });

  it('journey segment lists journeys and starts a journey plan', async () => {
    mockRouteParams = { segment: 'journey' };
    const { getByLabelText } = render(<PlanPickerScreen />);
    await waitFor(() => expect(getByLabelText('Study The Covenant')).toBeTruthy());

    fireEvent.press(getByLabelText('Study The Covenant'));
    await waitFor(() =>
      expect(mockStartStudyPlan).toHaveBeenCalledWith({
        planType: 'journey',
        sourceId: 'covenant-journey',
        title: 'The Covenant',
      }),
    );
  });

  it('topic segment hides topics with no relevant chapters', async () => {
    mockRouteParams = { segment: 'topic' };
    const { getByText, queryByText } = render(<PlanPickerScreen />);
    await waitFor(() => expect(getByText('Covenant')).toBeTruthy());
    expect(queryByText('Empty Topic')).toBeNull();
  });

  it('shows a gentle notice when a source resolves to zero items', async () => {
    mockStartStudyPlan.mockResolvedValue(null);
    const { getAllByLabelText, getByText } = render(<PlanPickerScreen />);
    await waitFor(() => expect(getAllByLabelText('Study Romans').length).toBeGreaterThan(0));

    fireEvent.press(getAllByLabelText('Study Romans')[0]);
    await waitFor(() =>
      expect(getByText('Nothing to study there yet — try another pick.')).toBeTruthy(),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
