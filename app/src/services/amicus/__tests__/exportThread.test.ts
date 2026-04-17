/**
 * Tests for services/amicus/exportThread.ts — Markdown export (#1472).
 */
import {
  exportThreadToMarkdown,
  formatThreadMarkdown,
  slugify,
} from '@/services/amicus/exportThread';
import type { AmicusMessage, AmicusThread } from '@/types';

const mockGetAmicusThread = jest.fn();
const mockListAmicusMessages = jest.fn();
jest.mock('@/db/userQueries', () => ({
  getAmicusThread: (id: string) => mockGetAmicusThread(id),
  listAmicusMessages: (id: string) => mockListAmicusMessages(id),
}));

const fixedDate = new Date('2026-04-17T12:34:56.000Z');

const sampleThread: AmicusThread = {
  thread_id: 't1',
  title: 'Covenant arc in Jeremiah',
  chapter_ref: 'jeremiah/29',
  pinned: false,
  created_at: '2026-04-17T10:00:00.000Z',
  last_message_at: '2026-04-17T10:05:00.000Z',
};

const sampleMessages: AmicusMessage[] = [
  {
    message_id: 'm1',
    thread_id: 't1',
    role: 'user',
    content: 'What is the covenant arc in Jeremiah 29-31?',
    citations: [],
    follow_ups: [],
    created_at: '2026-04-17T10:00:30.000Z',
  },
  {
    message_id: 'm2',
    thread_id: 't1',
    role: 'assistant',
    content: 'Jeremiah traces the Mosaic covenant forward to a new covenant.',
    citations: [
      {
        chunk_id: 'section_panel:jer-31-s1',
        source_type: 'section_panel',
        display_label: 'Jeremiah 31 · new covenant',
        scholar_id: 'calvin',
      },
      {
        chunk_id: 'word_study:berit',
        source_type: 'word_study',
        display_label: 'berit — covenant',
      },
    ],
    follow_ups: ['How does Hebrews pick up Jer 31?'],
    created_at: '2026-04-17T10:04:00.000Z',
  },
];

describe('slugify', () => {
  it('lowercases and replaces non-alphanumerics with dashes', () => {
    expect(slugify('Covenant Arc in Jeremiah 29-31')).toBe(
      'covenant-arc-in-jeremiah-29-31',
    );
  });
  it('strips diacritics and trims to 60 chars', () => {
    expect(slugify('Éléction — qu\u2019est-ce que c\u2019est ?')).toBe(
      'election-qu-est-ce-que-c-est',
    );
    expect(slugify('a'.repeat(100))).toHaveLength(60);
  });
});

describe('formatThreadMarkdown', () => {
  it('includes the title, timestamp, chapter context, and every message', () => {
    const md = formatThreadMarkdown(sampleThread, sampleMessages, {
      generatedAt: fixedDate,
    });
    expect(md).toContain('# Covenant arc in Jeremiah');
    expect(md).toContain('Exported from Amicus');
    expect(md).toContain('2026-04-17T12:34:56.000Z');
    expect(md).toContain('Context: jeremiah/29');
    expect(md).toContain('## You');
    expect(md).toContain('## Amicus');
    expect(md).toContain('What is the covenant arc in Jeremiah 29-31?');
    expect(md).toContain('Mosaic covenant forward to a new covenant');
  });

  it('renders a Sources list with scholar id when present', () => {
    const md = formatThreadMarkdown(sampleThread, sampleMessages, {
      generatedAt: fixedDate,
    });
    expect(md).toContain('**Sources:**');
    expect(md).toContain('Jeremiah 31 · new covenant (calvin)');
    expect(md).toContain('berit — covenant');
  });

  it('omits the Sources list when a message has no citations', () => {
    const md = formatThreadMarkdown(
      sampleThread,
      [sampleMessages[0]!],
      { generatedAt: fixedDate },
    );
    expect(md).not.toContain('**Sources:**');
  });

  it('handles empty message lists gracefully', () => {
    const md = formatThreadMarkdown(sampleThread, [], {
      generatedAt: fixedDate,
    });
    expect(md).toContain('_No messages in this thread yet._');
  });

  it('omits the context line when chapter_ref is null', () => {
    const md = formatThreadMarkdown(
      { ...sampleThread, chapter_ref: null },
      sampleMessages,
      { generatedAt: fixedDate },
    );
    expect(md).not.toContain('Context:');
  });
});

describe('exportThreadToMarkdown', () => {
  beforeEach(() => {
    mockGetAmicusThread.mockReset();
    mockListAmicusMessages.mockReset();
  });

  it('loads a thread + messages and returns the formatted payload', async () => {
    mockGetAmicusThread.mockResolvedValue(sampleThread);
    mockListAmicusMessages.mockResolvedValue(sampleMessages);
    const payload = await exportThreadToMarkdown('t1', { generatedAt: fixedDate });
    expect(payload.threadId).toBe('t1');
    expect(payload.title).toBe('Covenant arc in Jeremiah');
    expect(payload.markdown).toContain('# Covenant arc in Jeremiah');
    expect(payload.filename).toBe('covenant-arc-in-jeremiah-2026-04-17.md');
  });

  it('throws when the thread is not in the database', async () => {
    mockGetAmicusThread.mockResolvedValue(null);
    await expect(exportThreadToMarkdown('missing')).rejects.toThrow(
      /thread_not_found/,
    );
  });
});
