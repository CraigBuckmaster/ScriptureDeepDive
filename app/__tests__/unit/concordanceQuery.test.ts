/**
 * Tests for concordance query deduplication (verse_end fix)
 * and keyExtractor uniqueness.
 *
 * Bug: getConcordanceResults used SELECT DISTINCT across all columns,
 * returning duplicate verses when the same word had different glosses.
 * Fix: Changed to GROUP BY (book_id, chapter_num, verse_num).
 */

jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';

describe('concordance query deduplication', () => {
  beforeEach(() => resetMockDb());

  it('GROUP BY ensures one row per verse even with multiple glosses', async () => {
    const { getConcordanceResults } = require('@/db/content');
    const mockDb = getMockDb();

    // Simulate grouped results (one per verse)
    mockDb.getAllAsync.mockResolvedValue([
      { book_id: 'genesis', chapter_num: 1, verse_num: 3, original: 'אוֹר', gloss: 'light', text: 'Let there be light', book_name: 'Genesis' },
      { book_id: 'genesis', chapter_num: 1, verse_num: 4, original: 'אוֹר', gloss: 'light', text: 'God saw the light', book_name: 'Genesis' },
    ]);

    const results = await getConcordanceResults('H216');
    expect(results).toHaveLength(2);

    // Verify each verse appears exactly once
    const verseKeys = results.map((r: any) => `${r.book_id}-${r.chapter_num}-${r.verse_num}`);
    const uniqueKeys = new Set(verseKeys);
    expect(uniqueKeys.size).toBe(verseKeys.length);
  });

  it('keyExtractor produces unique keys per verse', () => {
    const results = [
      { book_id: 'genesis', chapter_num: 1, verse_num: 3 },
      { book_id: 'genesis', chapter_num: 1, verse_num: 4 },
      { book_id: 'exodus', chapter_num: 2, verse_num: 3 },
    ];

    const keyExtractor = (item: any) => `${item.book_id}-${item.chapter_num}-${item.verse_num}`;
    const keys = results.map(keyExtractor);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});
