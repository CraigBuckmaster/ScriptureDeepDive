import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import {
  getActiveGuidedStudySessions,
  getAllGuidedReviewItems,
  getConceptEncounters,
  getDueGuidedReviewItems,
  getOpenGuidedStudyQuestions,
  getRecentGuidedStudyTakeaways,
} from '@/db/userQueries';
import { completeGuidedReviewItem, resolveGuidedStudyQuestion } from '@/db/userMutations';

jest.mock('@/db/userQueries', () => ({
  getActiveGuidedStudySessions: jest.fn(),
  getAllGuidedReviewItems: jest.fn(),
  getConceptEncounters: jest.fn(),
  getDueGuidedReviewItems: jest.fn(),
  getOpenGuidedStudyQuestions: jest.fn(),
  getRecentGuidedStudyTakeaways: jest.fn(),
}));

jest.mock('@/db/userMutations', () => ({
  completeGuidedReviewItem: jest.fn().mockResolvedValue(undefined),
  resolveGuidedStudyQuestion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockGetActiveGuidedStudySessions = getActiveGuidedStudySessions as jest.MockedFunction<
  typeof getActiveGuidedStudySessions
>;
const mockGetAllGuidedReviewItems = getAllGuidedReviewItems as jest.MockedFunction<
  typeof getAllGuidedReviewItems
>;
const mockGetConceptEncounters = getConceptEncounters as jest.MockedFunction<
  typeof getConceptEncounters
>;
const mockGetDueGuidedReviewItems = getDueGuidedReviewItems as jest.MockedFunction<
  typeof getDueGuidedReviewItems
>;
const mockGetOpenGuidedStudyQuestions = getOpenGuidedStudyQuestions as jest.MockedFunction<
  typeof getOpenGuidedStudyQuestions
>;
const mockGetRecentGuidedStudyTakeaways = getRecentGuidedStudyTakeaways as jest.MockedFunction<
  typeof getRecentGuidedStudyTakeaways
>;
const mockCompleteGuidedReviewItem = completeGuidedReviewItem as jest.MockedFunction<
  typeof completeGuidedReviewItem
>;
const mockResolveGuidedStudyQuestion = resolveGuidedStudyQuestion as jest.MockedFunction<
  typeof resolveGuidedStudyQuestion
>;

describe('useReviewQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDueGuidedReviewItems.mockResolvedValue([
      {
        id: 1,
        source_session_id: 1,
        chapter_id: 'genesis_1',
        title: 'Genesis 1',
        prompt: 'What was your takeaway?',
        answer: 'Creation is ordered.',
        due_date: '2026-04-23',
        interval_days: 1,
        review_count: 0,
        status: 'due',
        created_at: '2026-04-23T00:00:00Z',
        updated_at: '2026-04-23T00:00:00Z',
      },
    ]);
    mockGetAllGuidedReviewItems.mockResolvedValue([]);
    mockGetConceptEncounters.mockResolvedValue([]);
    mockGetActiveGuidedStudySessions.mockResolvedValue([]);
    mockGetOpenGuidedStudyQuestions.mockResolvedValue([]);
    mockGetRecentGuidedStudyTakeaways.mockResolvedValue([]);
  });

  it('loads queue data and builds a next action', async () => {
    const { result } = renderHook(() => useReviewQueue());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.dueItems).toHaveLength(1);
    expect(result.current.nextAction?.kind).toBe('review');
  });

  it('completes review items and resolves questions through mutations', async () => {
    mockGetOpenGuidedStudyQuestions.mockResolvedValue([
      {
        id: 8,
        session_id: 2,
        chapter_id: 'genesis_1',
        question_text: 'Why repeat the structure?',
        status: 'open',
        created_at: '2026-04-23T00:00:00Z',
        resolved_at: null,
        updated_at: '2026-04-23T00:00:00Z',
      },
    ]);

    const { result } = renderHook(() => useReviewQueue());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.completeItem(1);
    });
    expect(mockCompleteGuidedReviewItem).toHaveBeenCalledWith(1);

    await act(async () => {
      await result.current.resolveQuestion(8);
    });
    expect(mockResolveGuidedStudyQuestion).toHaveBeenCalledWith(8);
  });
});
