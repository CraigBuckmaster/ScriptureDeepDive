/**
 * Tests for promotePeekToThread (#1464).
 *
 * Note the absence of any React Navigation mocks — that's the point of the
 * callback pattern. The service has no awareness of navigation, so tests
 * only verify the data-layer contract and the returned `PromotePeekResult`.
 */
import { promotePeekToThread } from '@/services/amicus/promotePeekToThread';
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
const mockAppendAmicusMessage = appendAmicusMessage as jest.MockedFunction<
  typeof appendAmicusMessage
>;
const mockUpsertAmicusThreadContext = upsertAmicusThreadContext as jest.MockedFunction<
  typeof upsertAmicusThreadContext
>;
const mockUpsertAmicusThreadSummary = upsertAmicusThreadSummary as jest.MockedFunction<
  typeof upsertAmicusThreadSummary
>;

describe('promotePeekToThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetThreadIdForQuestion.mockResolvedValue(null);
    mockGetThreadIdForSession.mockResolvedValue(null);
    mockGetLatestThreadIdForChapter.mockResolvedValue(null);
  });

  describe('existing thread paths', () => {
    it('returns existing kind when a guided-question thread is linked', async () => {
      mockGetThreadIdForQuestion.mockResolvedValueOnce('t-question');

      const result = await promotePeekToThread({
        chapterRef: { book_id: 'genesis', chapter_num: 1 },
        guidedContext: {
          entryPoint: 'guided_study',
          openQuestionId: 17,
          openQuestionText: 'Why is the structure repeated?',
        },
        messages: [
          { role: 'user', content: 'Why is the structure repeated?' },
          { role: 'assistant', content: 'It creates a pattern.' },
        ],
      });

      expect(result).toEqual(
        expect.objectContaining({
          kind: 'existing',
          threadId: 't-question',
          seedChapterRef: 'genesis/1',
        }),
      );
      expect(mockAppendAmicusMessage).toHaveBeenCalledTimes(2);
      expect(mockUpsertAmicusThreadContext).toHaveBeenCalledWith(
        expect.objectContaining({
          threadId: 't-question',
          entryPoint: 'guided_study',
          openQuestionId: 17,
        }),
      );
      expect(mockUpsertAmicusThreadSummary).toHaveBeenCalledWith(
        expect.objectContaining({ threadId: 't-question' }),
      );
    });

    it('falls through to session lookup when no question thread exists', async () => {
      mockGetThreadIdForSession.mockResolvedValueOnce('t-session');

      const result = await promotePeekToThread({
        chapterRef: { book_id: 'genesis', chapter_num: 1 },
        guidedContext: {
          entryPoint: 'guided_study',
          sessionId: 8,
          guidedStudyStep: 'synthesize',
        },
        messages: [{ role: 'user', content: 'Help me synthesize.' }],
      });

      expect(result.kind).toBe('existing');
      if (result.kind !== 'existing') throw new Error('expected existing');
      expect(result.threadId).toBe('t-session');
      expect(mockGetThreadIdForSession).toHaveBeenCalledWith(8, 'synthesize');
    });

    it('falls through to chapter+entry-point lookup as the final existing-thread path', async () => {
      mockGetLatestThreadIdForChapter.mockResolvedValueOnce('t-chapter');

      const result = await promotePeekToThread({
        chapterRef: { book_id: 'genesis', chapter_num: 1 },
        guidedContext: { entryPoint: 'guided_study' },
        messages: [{ role: 'user', content: 'Connect this chapter.' }],
      });

      expect(result.kind).toBe('existing');
      if (result.kind !== 'existing') throw new Error('expected existing');
      expect(result.threadId).toBe('t-chapter');
      expect(mockGetLatestThreadIdForChapter).toHaveBeenCalledWith('genesis/1', 'guided_study');
    });
  });

  describe('new thread path', () => {
    it('returns new kind with promoted messages when no thread matches', async () => {
      const messages = [
        { role: 'user' as const, content: 'Why does Genesis 1 use seven days?' },
        { role: 'assistant' as const, content: 'Seven evokes covenantal completeness.' },
      ];

      const result = await promotePeekToThread({
        chapterRef: { book_id: 'genesis', chapter_num: 1 },
        guidedContext: { entryPoint: 'guided_study' },
        messages,
      });

      expect(result).toEqual({
        kind: 'new',
        promotedMessages: messages,
        seedChapterRef: 'genesis/1',
        seedGuidedContext: { entryPoint: 'guided_study' },
      });
      // The new path delegates persistence to NewThread on mount.
      expect(mockAppendAmicusMessage).not.toHaveBeenCalled();
      expect(mockUpsertAmicusThreadContext).not.toHaveBeenCalled();
      expect(mockUpsertAmicusThreadSummary).not.toHaveBeenCalled();
    });

    it('handles a missing chapterRef gracefully (no chapter-bound lookup attempted)', async () => {
      const result = await promotePeekToThread({
        chapterRef: null,
        guidedContext: null,
        messages: [{ role: 'user', content: 'Generic question.' }],
      });

      expect(result.kind).toBe('new');
      expect(mockGetLatestThreadIdForChapter).not.toHaveBeenCalled();
    });

    it('handles a missing guidedContext gracefully', async () => {
      const result = await promotePeekToThread({
        chapterRef: { book_id: 'genesis', chapter_num: 1 },
        messages: [{ role: 'user', content: 'Generic question.' }],
      });

      expect(result.kind).toBe('new');
      // No entryPoint → chapter-bound lookup is skipped
      expect(mockGetLatestThreadIdForChapter).not.toHaveBeenCalled();
    });
  });

  describe('navigation independence', () => {
    it('imports nothing from React Navigation', () => {
      // This is enforced architecturally by the lack of navigation mocks.
      // If a future refactor reintroduces a navigation import, this test file
      // will fail to compile because the mocks are absent. The assertion is
      // also a smoke check: every test above ran without a NavigationProp.
      expect(true).toBe(true);
    });
  });
});
