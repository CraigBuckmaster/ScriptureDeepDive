import { buildAmicusContextEnvelope } from '@/services/amicus/context';
import { buildStudyActionSeeds } from '@/services/amicus/studyActions';

describe('buildStudyActionSeeds', () => {
  it('returns three chapter-oriented actions when chapter context is present', () => {
    const context = buildAmicusContextEnvelope({
      entryPoint: 'thread',
      chipContext: {
        kind: 'chapter',
        bookId: 'genesis',
        chapterNum: 1,
      },
    });

    expect(buildStudyActionSeeds(context)).toEqual([
      {
        key: 'explain_context',
        label: 'Explain this chapter',
        seedQuery:
          'Give me a guided overview of Genesis 1. What should I notice before I interpret it?',
      },
      {
        key: 'interpretive_tensions',
        label: 'Show interpretive tensions',
        seedQuery:
          'Show me the main interpretive tensions in Genesis 1. Distinguish broad consensus from debated readings.',
      },
      {
        key: 'trace_connections',
        label: 'Trace key connections',
        seedQuery:
          'Trace the most important canonical connections for Genesis 1. Keep the connections grounded in the text.',
      },
    ]);
  });

  it('returns a debate summary action for debate-topic context', () => {
    const context = buildAmicusContextEnvelope({
      entryPoint: 'peek',
      chipContext: {
        kind: 'debate_topic',
        topicId: 'predestination',
      },
    });

    expect(buildStudyActionSeeds(context)).toEqual([
      {
        key: 'interpretive_tensions',
        label: 'Summarize this debate',
        seedQuery:
          'Summarize the main positions in this debate and explain where the strongest tensions are.',
      },
    ]);
  });

  it('returns no actions when there is no contextual hook to build from', () => {
    const context = buildAmicusContextEnvelope({
      entryPoint: 'peek',
      chipContext: { kind: 'none' },
    });

    expect(buildStudyActionSeeds(context)).toEqual([]);
  });

  it('prioritizes guided-study actions when a question or takeaway is present', () => {
    const context = buildAmicusContextEnvelope({
      entryPoint: 'guided_study',
      chapterRef: { book_id: 'genesis', chapter_num: 1 },
      guidedStudyContext: {
        openQuestionText: 'Why is the structure repeated?',
        takeaway: 'Creation unfolds in ordered stages.',
      },
    });

    expect(buildStudyActionSeeds(context).slice(0, 2)).toEqual([
      {
        key: 'investigate_question',
        label: 'Investigate my question',
        seedQuery: 'Help me investigate this study question: Why is the structure repeated?',
      },
      {
        key: 'refine_takeaway',
        label: 'Refine takeaway',
        seedQuery:
          'Help me refine this takeaway so it stays faithful to the text: Creation unfolds in ordered stages.',
      },
    ]);
  });
});
