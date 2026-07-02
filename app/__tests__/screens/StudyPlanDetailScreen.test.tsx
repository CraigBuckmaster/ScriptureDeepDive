/**
 * #1833 — StudyPlanDetailScreen: item list with completion state,
 * per-item resume, archive action. (Not the legacy PlanDetailScreen.)
 */
import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
    useRoute: () => ({ params: { planId: 'plan-1' } }),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

const mockGetStudyPlan = jest.fn();
const mockGetStudyPlanItems = jest.fn();
jest.mock('@/db/userQueries', () => ({
  getStudyPlan: (...args: unknown[]) => mockGetStudyPlan(...args),
  getStudyPlanItems: (...args: unknown[]) => mockGetStudyPlanItems(...args),
}));

const mockArchiveStudyPlan = jest.fn().mockResolvedValue(undefined);
jest.mock('@/db/userMutations', () => ({
  archiveStudyPlan: (...args: unknown[]) => mockArchiveStudyPlan(...args),
}));

jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn().mockReturnValue(true),
}));

import StudyPlanDetailScreen from '@/screens/StudyPlanDetailScreen';

const PLAN = {
  id: 'plan-1',
  plan_type: 'book',
  source_id: 'jonah',
  title: 'Jonah',
  default_mode: 'quick',
  created_at: '2026-06-01 00:00:00',
  archived_at: null,
};

const ITEMS = [1, 2, 3, 4].map((n) => ({
  plan_id: 'plan-1',
  item_num: n,
  kind: 'session',
  ref_json: JSON.stringify({ bookId: 'jonah', chapterNum: n }),
  session_id: n === 1 ? '9' : null,
  completed_at: n === 1 ? '2026-06-02 08:00:00' : null,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStudyPlan.mockResolvedValue(PLAN);
  mockGetStudyPlanItems.mockResolvedValue(ITEMS);
});

describe('StudyPlanDetailScreen (#1833)', () => {
  it('renders the plan title, progress line, and every item with completion state', async () => {
    const { getByText, getByLabelText } = render(<StudyPlanDetailScreen />);
    await waitFor(() => {
      expect(getByText('Jonah')).toBeTruthy();
      expect(getByText('1 of 4 complete')).toBeTruthy();
      expect(getByLabelText('Jonah 1, complete. Revisit session')).toBeTruthy();
      expect(getByLabelText('Jonah 2. Resume here')).toBeTruthy();
      expect(getByText('Jonah 4')).toBeTruthy();
    });
  });

  it('resumes an item into StudySession with the planId', async () => {
    const { getByLabelText } = render(<StudyPlanDetailScreen />);
    await waitFor(() => expect(getByLabelText('Jonah 2. Resume here')).toBeTruthy());

    fireEvent.press(getByLabelText('Jonah 2. Resume here'));
    expect(mockNavigate).toHaveBeenCalledWith('StudySession', {
      bookId: 'jonah',
      chapterNum: 2,
      planId: 'plan-1',
    });
  });

  it('archives after confirmation and goes back', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => {
      const archive = buttons?.find((b) => b.text === 'Archive');
      archive?.onPress?.();
    });

    const { getByLabelText } = render(<StudyPlanDetailScreen />);
    await waitFor(() => expect(getByLabelText('Archive the Jonah plan')).toBeTruthy());

    fireEvent.press(getByLabelText('Archive the Jonah plan'));
    await waitFor(() => {
      expect(mockArchiveStudyPlan).toHaveBeenCalledWith('plan-1');
      expect(mockGoBack).toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });

  it('shows a not-found state for an unknown plan', async () => {
    mockGetStudyPlan.mockResolvedValue(null);
    mockGetStudyPlanItems.mockResolvedValue([]);
    const { getByText } = render(<StudyPlanDetailScreen />);
    await waitFor(() => expect(getByText('Plan not found')).toBeTruthy());
  });
});
