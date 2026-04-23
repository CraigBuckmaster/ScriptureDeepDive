import { renderHook, waitFor } from '@testing-library/react-native';
import { useGuidedStudyChapterState } from '@/hooks/useGuidedStudyChapterState';
import {
  getActiveGuidedStudySession,
  getDueGuidedReviewItemCountForChapter,
} from '@/db/userQueries';

jest.mock('@/db/userQueries', () => ({
  getActiveGuidedStudySession: jest.fn(),
  getDueGuidedReviewItemCountForChapter: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockGetActiveGuidedStudySession = getActiveGuidedStudySession as jest.MockedFunction<
  typeof getActiveGuidedStudySession
>;
const mockGetDueGuidedReviewItemCountForChapter =
  getDueGuidedReviewItemCountForChapter as jest.MockedFunction<
    typeof getDueGuidedReviewItemCountForChapter
  >;

describe('useGuidedStudyChapterState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns continue mode when there is an active session', async () => {
    mockGetActiveGuidedStudySession.mockResolvedValueOnce({
      id: 4,
      chapter_id: 'genesis_1',
      status: 'active',
      current_step: 'observe',
      started_at: '2026-04-23T00:00:00Z',
      completed_at: null,
      updated_at: '2026-04-23T00:00:00Z',
    });
    mockGetDueGuidedReviewItemCountForChapter.mockResolvedValueOnce(0);

    const { result } = renderHook(() => useGuidedStudyChapterState('genesis_1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mode).toBe('continue');
    expect(result.current.initialStep).toBe('observe');
  });

  it('returns review mode when prompts are due and no active session exists', async () => {
    mockGetActiveGuidedStudySession.mockResolvedValueOnce(null);
    mockGetDueGuidedReviewItemCountForChapter.mockResolvedValueOnce(2);

    const { result } = renderHook(() => useGuidedStudyChapterState('genesis_1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.mode).toBe('review');
    expect(result.current.dueCount).toBe(2);
    expect(result.current.initialStep).toBe('review');
  });
});
