import { matchVerses, type VersePair } from '@/utils/verseMatch';
import type { Verse } from '@/types';

const makeVerse = (num: number, text: string, translation = 'kjv'): Verse => ({
  id: num,
  book_id: 'genesis',
  chapter_num: 1,
  verse_num: num,
  translation,
  text,
});

describe('matchVerses', () => {
  it('pairs primary and comparison verses by verse_num', () => {
    const primary = [makeVerse(1, 'In the beginning'), makeVerse(2, 'And the earth')];
    const comparison = [makeVerse(1, 'In the start'), makeVerse(2, 'The earth was')];
    const result = matchVerses(primary, comparison);

    expect(result).toHaveLength(2);
    expect(result[0].primary.text).toBe('In the beginning');
    expect(result[0].comparison?.text).toBe('In the start');
    expect(result[1].primary.verse_num).toBe(2);
    expect(result[1].comparison?.verse_num).toBe(2);
  });

  it('returns null comparison when verse is missing', () => {
    const primary = [makeVerse(1, 'Verse one'), makeVerse(2, 'Verse two'), makeVerse(3, 'Verse three')];
    const comparison = [makeVerse(1, 'V one'), makeVerse(3, 'V three')];
    const result = matchVerses(primary, comparison);

    expect(result).toHaveLength(3);
    expect(result[0].comparison?.text).toBe('V one');
    expect(result[1].comparison).toBeNull();
    expect(result[2].comparison?.text).toBe('V three');
  });

  it('handles empty comparison array', () => {
    const primary = [makeVerse(1, 'Text')];
    const result = matchVerses(primary, []);

    expect(result).toHaveLength(1);
    expect(result[0].comparison).toBeNull();
  });

  it('handles empty primary array', () => {
    const result = matchVerses([], [makeVerse(1, 'Text')]);
    expect(result).toHaveLength(0);
  });

  it('ignores extra comparison verses not in primary', () => {
    const primary = [makeVerse(1, 'A')];
    const comparison = [makeVerse(1, 'B'), makeVerse(2, 'C'), makeVerse(99, 'Extra')];
    const result = matchVerses(primary, comparison);

    expect(result).toHaveLength(1);
    expect(result[0].comparison?.text).toBe('B');
  });
});
