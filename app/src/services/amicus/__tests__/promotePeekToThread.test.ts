/**
 * Tests for promotePeekToThread — handoff from peek to persistent thread.
 */
import { getMockUserDb, resetMockUserDb } from '../../../../__tests__/helpers/mockUserDb';
import type { PeekMessage } from '@/hooks/usePeekConversation';
import {
  buildThreadTitle,
  promotePeekToThread,
  type PromoteNavigation,
} from '@/services/amicus/promotePeekToThread';

jest.mock('@/db/userDatabase', () =>
  require('../../../../__tests__/helpers/mockUserDb').mockUserDatabaseModule(),
);

function makeNav(): { nav: PromoteNavigation; parentNavigate: jest.Mock } {
  const parentNavigate = jest.fn();
  const nav: PromoteNavigation = {
    getParent: () => ({ navigate: parentNavigate }),
  };
  return { nav, parentNavigate };
}

const threeTurnPeek: PeekMessage[] = [
  { role: 'user', content: 'Explain election in Romans 9' },
  {
    role: 'assistant',
    content: 'Calvin and Barth differ here.',
    citations: [
      {
        chunk_id: 'section_panel:romans-9-s1-calvin',
        source_type: 'section_panel',
        display_label: 'Calvin · Romans 9',
        scholar_id: 'calvin',
      },
    ],
    follow_ups: ['What does Barth say?'],
    isStreaming: false,
  },
  { role: 'user', content: 'What does Barth say?' },
  {
    role: 'assistant',
    content: 'Barth reframes election christologically.',
    citations: [],
    follow_ups: [],
    isStreaming: false,
  },
  { role: 'user', content: 'And the Jewish view?' },
  {
    role: 'assistant',
    content: 'Rabbinic tradition reads it corporately.',
    citations: [],
    follow_ups: [],
    isStreaming: false,
  },
];

describe('buildThreadTitle', () => {
  it('returns the fallback for very short first messages', () => {
    expect(buildThreadTitle('hi')).toBe('New Amicus conversation');
    expect(buildThreadTitle('')).toBe('New Amicus conversation');
    expect(buildThreadTitle(undefined)).toBe('New Amicus conversation');
  });

  it('returns the raw text when under the 50-char limit', () => {
    expect(buildThreadTitle('What does the Hebrew chesed mean?')).toBe(
      'What does the Hebrew chesed mean?',
    );
  });

  it('truncates at a word boundary and appends an ellipsis when over the limit', () => {
    const title = buildThreadTitle(
      'Why do Reformed and Jewish scholars read election differently here?',
    );
    expect(title.endsWith('…')).toBe(true);
    expect(title.length).toBeLessThanOrEqual(51);
    // No trailing whitespace directly before the ellipsis.
    expect(title).not.toMatch(/\s…$/);
    // And the cut happened on a word boundary — the original text should
    // contain the title's prose prefix followed by a space.
    expect(
      'Why do Reformed and Jewish scholars read election differently here?'.startsWith(
        title.slice(0, -1) + ' ',
      ),
    ).toBe(true);
  });

  it('hard-cuts when there is no usable word boundary', () => {
    const title = buildThreadTitle('a'.repeat(80));
    expect(title).toBe('a'.repeat(50) + '…');
  });

  it('trims whitespace before deciding length', () => {
    expect(buildThreadTitle('   short   ')).toBe('New Amicus conversation');
  });
});

describe('promotePeekToThread', () => {
  beforeEach(() => resetMockUserDb());

  it('creates a thread + all messages then navigates to AmicusTab/Thread', async () => {
    const { nav, parentNavigate } = makeNav();
    const db = getMockUserDb();
    let idCounter = 0;
    const makeId = (prefix: string) => `${prefix}-${idCounter++}`;

    const threadId = await promotePeekToThread({
      peekMessages: threeTurnPeek,
      chapterRef: { book_id: 'romans', chapter_num: 9 },
      navigation: nav,
      makeId,
    });

    expect(threadId).toBe('t-0');

    const insertCalls = db.runAsync.mock.calls;
    const threadInsert = insertCalls.find(
      (c) => typeof c[0] === 'string' && c[0].includes('INSERT INTO amicus_threads'),
    );
    expect(threadInsert).toBeDefined();
    expect(threadInsert![1]).toEqual([
      't-0',
      'Explain election in Romans 9',
      'romans/9',
    ]);

    const messageInserts = insertCalls.filter(
      (c) => typeof c[0] === 'string' && c[0].includes('INSERT INTO amicus_messages'),
    );
    expect(messageInserts).toHaveLength(threeTurnPeek.length);

    // First assistant message should have citations + follow_ups serialized.
    const firstAssistant = messageInserts[1]!;
    expect(firstAssistant[1]![2]).toBe('assistant');
    expect(firstAssistant[1]![4]).toContain('section_panel:romans-9-s1-calvin');
    expect(firstAssistant[1]![5]).toContain('What does Barth say?');

    expect(parentNavigate).toHaveBeenCalledWith('AmicusTab', {
      screen: 'Thread',
      params: { threadId: 't-0' },
    });
  });

  it('passes null chapter_ref when the peek has no chapter context', async () => {
    const { nav } = makeNav();
    const db = getMockUserDb();

    await promotePeekToThread({
      peekMessages: [
        { role: 'user', content: 'what is grace generally?' },
        { role: 'assistant', content: 'A gift.', isStreaming: false },
      ],
      chapterRef: null,
      navigation: nav,
    });

    const threadInsert = db.runAsync.mock.calls.find(
      (c) => typeof c[0] === 'string' && c[0].includes('INSERT INTO amicus_threads'),
    );
    expect(threadInsert![1]![2]).toBeNull();
  });

  it('propagates a DB error so the caller can keep the peek open', async () => {
    const { nav, parentNavigate } = makeNav();
    const db = getMockUserDb();
    db.runAsync.mockRejectedValueOnce(new Error('disk full'));

    await expect(
      promotePeekToThread({
        peekMessages: threeTurnPeek,
        navigation: nav,
      }),
    ).rejects.toThrow('disk full');

    expect(parentNavigate).not.toHaveBeenCalled();
  });

  it('still completes the write when there is no parent navigator', async () => {
    const db = getMockUserDb();
    const navNoParent: PromoteNavigation = { getParent: () => undefined };

    const threadId = await promotePeekToThread({
      peekMessages: [
        { role: 'user', content: 'hello there friend' },
        { role: 'assistant', content: 'hi', isStreaming: false },
      ],
      navigation: navNoParent,
    });

    expect(threadId).toMatch(/^t-/);
    expect(db.runAsync).toHaveBeenCalled();
  });
});
