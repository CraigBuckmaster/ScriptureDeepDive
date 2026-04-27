import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { launchAmicusStudyThread } from '@/services/amicus/studyLaunch';
import {
  getAmicusThreadIdForGuidedQuestion,
  getAmicusThreadIdForGuidedSession,
  getLatestAmicusThreadIdForChapterContext,
} from '@/db/userQueries';
import {
  appendAmicusMessage,
  upsertAmicusThreadContext,
  upsertAmicusThreadSummary,
} from '@/db/userMutations';

jest.mock('@/db/userQueries', () => ({
  getAmicusThreadIdForGuidedQuestion: jest.fn(),
  getAmicusThreadIdForGuidedSession: jest.fn(),
  getLatestAmicusThreadIdForChapterContext: jest.fn(),
}));

jest.mock('@/db/userMutations', () => ({
  appendAmicusMessage: jest.fn().mockResolvedValue(undefined),
  upsertAmicusThreadContext: jest.fn().mockResolvedValue(undefined),
  upsertAmicusThreadSummary: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const mockGetThreadIdForQuestion = getAmicusThreadIdForGuidedQuestion as jest.MockedFunction<
  typeof getAmicusThreadIdForGuidedQuestion
>;
const mockGetThreadIdForSession = getAmicusThreadIdForGuidedSession as jest.MockedFunction<
  typeof getAmicusThreadIdForGuidedSession
>;
const mockGetLatestThreadIdForChapter =
  getLatestAmicusThreadIdForChapterContext as jest.MockedFunction<
    typeof getLatestAmicusThreadIdForChapterContext
  >;
// The mutation mocks are referenced in test scaffolding even if not asserted
// in every individual test; keep them imported so jest's auto-cleanup works.
void appendAmicusMessage;
void upsertAmicusThreadContext;
void upsertAmicusThreadSummary;

describe('launchAmicusStudyThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetThreadIdForQuestion.mockResolvedValue(null);
    mockGetThreadIdForSession.mockResolvedValue(null);
    mockGetLatestThreadIdForChapter.mockResolvedValue(null);
  });

  it('reuses an existing linked question thread when available', async () => {
    const parent = { navigate: jest.fn() };
    const navigation = { getParent: () => parent } as unknown as NavigationProp<ParamListBase>;
    mockGetThreadIdForQuestion.mockResolvedValueOnce('t-linked');

    await launchAmicusStudyThread(navigation, {
      entryPoint: 'my_study',
      chapterId: 'genesis_1',
      sessionId: 8,
      guidedStudyStep: 'synthesize',
      openQuestionId: 3,
      openQuestionText: 'Why is the structure repeated?',
      seedQuery: 'Investigate this question',
    });

    expect(parent.navigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'Thread',
      params: expect.objectContaining({
        threadId: 't-linked',
        seedChapterRef: 'genesis/1',
      }),
    });
  });

  it('creates a new seeded thread when no existing study thread is found', async () => {
    const parent = { navigate: jest.fn() };
    const navigation = { getParent: () => parent } as unknown as NavigationProp<ParamListBase>;

    await launchAmicusStudyThread(navigation, {
      entryPoint: 'guided_study',
      chapterId: 'genesis_1',
      sessionId: 8,
      guidedStudyStep: 'synthesize',
      takeaway: 'Creation unfolds in ordered stages.',
      seedQuery: 'Help me refine this takeaway',
    });

    expect(parent.navigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'NewThread',
      params: expect.objectContaining({
        seedQuery: 'Help me refine this takeaway',
        seedChapterRef: 'genesis/1',
        seedGuidedContext: expect.objectContaining({
          sessionId: 8,
          guidedStudyStep: 'synthesize',
          takeaway: 'Creation unfolds in ordered stages.',
        }),
      }),
    });
  });
});
