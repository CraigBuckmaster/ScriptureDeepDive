import {
  buildAmicusContextEnvelope,
  chapterRefFromChipContext,
  formatAmicusContextLabel,
  normalizeChapterRef,
  serializeAmicusChapterRef,
} from '@/services/amicus/context';

describe('amicus context helpers', () => {
  it('derives a chapter ref from chapter chip context', () => {
    expect(
      chapterRefFromChipContext({
        kind: 'chapter',
        bookId: 'genesis',
        chapterNum: 1,
      }),
    ).toEqual({
      book_id: 'genesis',
      chapter_num: 1,
    });
  });

  it('returns null when the chip context is not chapter-based', () => {
    expect(chapterRefFromChipContext({ kind: 'none' })).toBeNull();
    expect(
      chapterRefFromChipContext({
        kind: 'person',
        personId: 'moses',
      }),
    ).toBeNull();
  });

  it('normalizes both slash and legacy colon chapter refs', () => {
    expect(normalizeChapterRef('romans/8')).toEqual({
      book_id: 'romans',
      chapter_num: 8,
    });
    expect(normalizeChapterRef('romans:8')).toEqual({
      book_id: 'romans',
      chapter_num: 8,
    });
  });

  it('serializes normalized chapter refs with slash format', () => {
    expect(serializeAmicusChapterRef('romans:8')).toBe('romans/8');
    expect(
      serializeAmicusChapterRef({
        book_id: 'john',
        chapter_num: 3,
      }),
    ).toBe('john/3');
  });

  it('builds an envelope from route chapter context when no override is provided', () => {
    expect(
      buildAmicusContextEnvelope({
        entryPoint: 'peek',
        chipContext: {
          kind: 'chapter',
          bookId: 'psalms',
          chapterNum: 23,
        },
      }),
    ).toEqual({
      entryPoint: 'peek',
      routeContext: {
        kind: 'chapter',
        bookId: 'psalms',
        chapterNum: 23,
      },
      chapterRef: {
        book_id: 'psalms',
        chapter_num: 23,
      },
      sessionId: null,
      guidedStudyStep: null,
      openQuestionId: null,
      openQuestionText: null,
      takeaway: null,
      keyConnection: null,
    });
  });

  it('prefers an explicit chapter ref override when building an envelope', () => {
    expect(
      buildAmicusContextEnvelope({
        entryPoint: 'thread',
        chipContext: { kind: 'none' },
        chapterRef: 'genesis:1',
      }),
    ).toEqual({
      entryPoint: 'thread',
      routeContext: { kind: 'none' },
      chapterRef: {
        book_id: 'genesis',
        chapter_num: 1,
      },
      sessionId: null,
      guidedStudyStep: null,
      openQuestionId: null,
      openQuestionText: null,
      takeaway: null,
      keyConnection: null,
    });
  });

  it('carries guided-study context into the envelope', () => {
    expect(
      buildAmicusContextEnvelope({
        entryPoint: 'guided_study',
        chipContext: { kind: 'none' },
        guidedStudyContext: {
          sessionId: 12,
          guidedStudyStep: 'synthesize',
          openQuestionId: 5,
          openQuestionText: 'Why is this repeated?',
          takeaway: 'Creation is ordered.',
          keyConnection: 'John 1',
        },
      }),
    ).toEqual({
      entryPoint: 'guided_study',
      routeContext: { kind: 'none' },
      chapterRef: null,
      sessionId: 12,
      guidedStudyStep: 'synthesize',
      openQuestionId: 5,
      openQuestionText: 'Why is this repeated?',
      takeaway: 'Creation is ordered.',
      keyConnection: 'John 1',
    });
  });

  it('formats human-readable context labels from stored refs', () => {
    expect(formatAmicusContextLabel('1_corinthians/13')).toBe('1 Corinthians 13');
    expect(formatAmicusContextLabel('romans:8')).toBe('Romans 8');
    expect(formatAmicusContextLabel(null)).toBeNull();
  });
});
