import {
  deriveThreadIntelligence,
  shouldAutoRenameThread,
} from '@/services/amicus/threadIntelligence';

describe('thread intelligence', () => {
  it('derives chapter-aware titles and summaries for study actions', () => {
    expect(
      deriveThreadIntelligence({
        currentTitle: 'New conversation',
        chapterRef: 'genesis/1',
        userQuery: 'Give me a guided overview of Genesis 1.',
        action: {
          key: 'explain_context',
          label: 'Explain this chapter',
          seedQuery: 'Give me a guided overview of Genesis 1.',
        },
      }),
    ).toEqual({
      title: 'Genesis 1 — chapter overview',
      summaryText: 'Explain this chapter in Genesis 1.',
      lastUserIntent: 'Explain this chapter',
    });
  });

  it('falls back to the user query for generic chapter threads', () => {
    expect(
      deriveThreadIntelligence({
        currentTitle: 'New conversation',
        chapterRef: 'romans/8',
        userQuery: 'How does this chapter connect adoption and suffering?',
      }),
    ).toEqual({
      title: 'Romans 8 — How does this chapter connect adopt…',
      summaryText: 'How does this chapter connect adoption and suffering?',
      lastUserIntent: null,
    });
  });

  it('does not overwrite explicit custom titles', () => {
    expect(
      deriveThreadIntelligence({
        currentTitle: 'My Romans thread',
        chapterRef: 'romans/8',
        userQuery: 'What is Paul doing here?',
      }).title,
    ).toBe('My Romans thread');
  });

  it('recognizes untitled threads for auto-rename', () => {
    expect(shouldAutoRenameThread(undefined)).toBe(true);
    expect(shouldAutoRenameThread('New conversation')).toBe(true);
    expect(shouldAutoRenameThread('My saved thread')).toBe(false);
  });

  it('prefers open-question context for study-linked threads', () => {
    expect(
      deriveThreadIntelligence({
        currentTitle: 'New conversation',
        chapterRef: 'genesis/1',
        userQuery: 'Help me investigate this study question.',
        openQuestionText: 'Why is the structure repeated?',
      }),
    ).toEqual({
      title: 'Genesis 1 — Why is the structure repeated?',
      summaryText: 'Investigating: Why is the structure repeated?',
      lastUserIntent: 'Investigate question',
    });
  });

  it('uses takeaway context when refining synthesis', () => {
    expect(
      deriveThreadIntelligence({
        currentTitle: 'New conversation',
        chapterRef: 'genesis/1',
        userQuery: 'Help me refine this synthesis.',
        takeaway: 'Creation unfolds in ordered stages.',
      }),
    ).toEqual({
      title: 'Genesis 1 — refine takeaway',
      summaryText: 'Refining takeaway: Creation unfolds in ordered stages.',
      lastUserIntent: 'Refine takeaway',
    });
  });
});
