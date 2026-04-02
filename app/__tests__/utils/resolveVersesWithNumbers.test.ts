jest.mock('@/db/content', () => ({
  getVerses: jest.fn().mockResolvedValue([
    { id: 1, book_id: 'genesis', chapter_num: 1, verse_num: 1, translation: 'kjv', text: 'In the beginning' },
    { id: 2, book_id: 'genesis', chapter_num: 1, verse_num: 2, translation: 'kjv', text: 'And the earth was' },
    { id: 3, book_id: 'genesis', chapter_num: 1, verse_num: 3, translation: 'kjv', text: 'And God said' },
  ]),
}));

import { resolveVersesWithNumbers, parseReference } from '@/utils/verseResolver';

describe('resolveVersesWithNumbers', () => {
  it('returns all verses with numbers when no verse range', async () => {
    const ref = parseReference('Genesis 1')!;
    const result = await resolveVersesWithNumbers(ref);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ verseNum: 1, text: 'In the beginning' });
    expect(result[2]).toEqual({ verseNum: 3, text: 'And God said' });
  });

  it('filters verses to specified range', async () => {
    const ref = parseReference('Genesis 1:2-3')!;
    const result = await resolveVersesWithNumbers(ref);
    expect(result).toHaveLength(2);
    expect(result[0].verseNum).toBe(2);
    expect(result[1].verseNum).toBe(3);
  });

  it('returns single verse when only verseStart specified', async () => {
    const ref = parseReference('Genesis 1:1')!;
    const result = await resolveVersesWithNumbers(ref);
    expect(result).toHaveLength(1);
    expect(result[0].verseNum).toBe(1);
  });
});
