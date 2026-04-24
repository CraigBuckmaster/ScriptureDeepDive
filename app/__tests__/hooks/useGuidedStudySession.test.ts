import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockCreateOrResume = jest.fn();
const mockSetStep = jest.fn();
const mockUpsertResponse = jest.fn();
const mockUpsertSynthesis = jest.fn();
const mockCompleteSession = jest.fn();
const mockCreateReviewItems = jest.fn();
const mockRecordConcept = jest.fn();
const mockUpsertQuestion = jest.fn();
const mockGetSession = jest.fn();
const mockGetResponses = jest.fn();
const mockGetSynthesis = jest.fn();
const mockBuildReviewItems = jest.fn();

jest.mock('@/db/userMutations', () => ({
  createOrResumeGuidedStudySession: (...args: any[]) => mockCreateOrResume(...args),
  setGuidedStudyStep: (...args: any[]) => mockSetStep(...args),
  upsertGuidedStudyResponse: (...args: any[]) => mockUpsertResponse(...args),
  upsertGuidedStudySynthesis: (...args: any[]) => mockUpsertSynthesis(...args),
  completeGuidedStudySession: (...args: any[]) => mockCompleteSession(...args),
  createGuidedReviewItems: (...args: any[]) => mockCreateReviewItems(...args),
  recordConceptEncounter: (...args: any[]) => mockRecordConcept(...args),
  upsertGuidedStudyQuestion: (...args: any[]) => mockUpsertQuestion(...args),
}));

jest.mock('@/db/userQueries', () => ({
  getGuidedStudySession: (...args: any[]) => mockGetSession(...args),
  getGuidedStudyResponses: (...args: any[]) => mockGetResponses(...args),
  getGuidedStudySynthesis: (...args: any[]) => mockGetSynthesis(...args),
}));

jest.mock('@/services/guidedStudy', () => ({
  buildReviewItemsFromSynthesis: (...args: any[]) => mockBuildReviewItems(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

import { useGuidedStudySession } from '@/hooks/useGuidedStudySession';

describe('useGuidedStudySession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOrResume.mockResolvedValue(42);
    mockGetSession.mockResolvedValue({ current_step: 'scene' });
    mockGetResponses.mockResolvedValue([]);
    mockGetSynthesis.mockResolvedValue(null);
    mockSetStep.mockResolvedValue(undefined);
    mockUpsertResponse.mockResolvedValue(undefined);
    mockUpsertSynthesis.mockResolvedValue(undefined);
    mockCompleteSession.mockResolvedValue(undefined);
    mockCreateReviewItems.mockResolvedValue(undefined);
    mockRecordConcept.mockResolvedValue(undefined);
    mockUpsertQuestion.mockResolvedValue(undefined);
  });

  it('is not loading and has no sessionId when chapterId is undefined', async () => {
    const { result } = renderHook(() => useGuidedStudySession(undefined));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.sessionId).toBeNull();
    expect(mockCreateOrResume).not.toHaveBeenCalled();
  });

  it('creates/resumes a session and hydrates state from the DB', async () => {
    mockGetSession.mockResolvedValue({ current_step: 'observe' });
    mockGetResponses.mockResolvedValue([
      { id: 1, session_id: 42, prompt_key: 'k1', prompt_text: 'q', response_text: 'a', updated_at: 't' },
    ]);
    mockGetSynthesis.mockResolvedValue({
      takeaway: 'T',
      open_question: 'Q',
      key_connection: 'C',
    });

    const { result } = renderHook(() => useGuidedStudySession('genesis_1'));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockCreateOrResume).toHaveBeenCalledWith('genesis_1');
    expect(result.current.sessionId).toBe(42);
    expect(result.current.currentStep).toBe('observe');
    expect(result.current.responses).toHaveProperty('k1');
    expect(result.current.synthesis).toEqual({
      takeaway: 'T',
      open_question: 'Q',
      key_connection: 'C',
    });
  });

  it('setCurrentStep persists the step to the DB', async () => {
    const { result } = renderHook(() => useGuidedStudySession('genesis_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.setCurrentStep('explore');
    });
    expect(result.current.currentStep).toBe('explore');
    expect(mockSetStep).toHaveBeenCalledWith(42, 'explore');
  });

  it('saveResponse optimistically updates state and writes through', async () => {
    const { result } = renderHook(() => useGuidedStudySession('genesis_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveResponse('p1', 'prompt?', 'my answer');
    });
    expect(result.current.responses.p1.response_text).toBe('my answer');
    expect(mockUpsertResponse).toHaveBeenCalledWith(42, 'p1', 'prompt?', 'my answer');
  });

  it('saveSynthesis updates state and writes through', async () => {
    const { result } = renderHook(() => useGuidedStudySession('genesis_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const draft = { takeaway: 'T2', open_question: 'Q2', key_connection: 'C2' };
    await act(async () => {
      await result.current.saveSynthesis(draft);
    });
    expect(result.current.synthesis).toEqual(draft);
    expect(mockUpsertSynthesis).toHaveBeenCalledWith(42, draft);
  });

  it('savePremiumReview builds items, records concepts, completes session, flips to review', async () => {
    mockBuildReviewItems.mockReturnValue([{ prompt: 'p', answer: 'a', intervalDays: 1 }]);

    const { result } = renderHook(() => useGuidedStudySession('genesis_1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.savePremiumReview('Chapter Title', [
        { id: 'creation', label: 'Creation' } as any,
        { id: 'covenant', label: 'Covenant' } as any,
      ]);
    });

    expect(mockCreateReviewItems).toHaveBeenCalledWith(
      42,
      'genesis_1',
      'Chapter Title',
      [{ prompt: 'p', answer: 'a', intervalDays: 1 }],
    );
    expect(mockRecordConcept).toHaveBeenCalledTimes(2);
    expect(mockCompleteSession).toHaveBeenCalledWith(42);
    expect(result.current.currentStep).toBe('review');
  });

  it('savePremiumReview no-ops when chapterId is missing', async () => {
    const { result } = renderHook(() => useGuidedStudySession(undefined));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.savePremiumReview('Title', []);
    });
    expect(mockCreateReviewItems).not.toHaveBeenCalled();
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });
});
