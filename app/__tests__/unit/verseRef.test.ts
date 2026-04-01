import { formatVerseRef, chapterPrefix, parseVerseRef, extractVerseNum, displayRef } from '@/utils/verseRef';

describe('verseRef', () => {
  describe('formatVerseRef', () => {
    it('formats a full verse reference', () => {
      expect(formatVerseRef('genesis', 1, 3)).toBe('genesis 1:3');
    });

    it('formats a chapter-level reference when no verse', () => {
      expect(formatVerseRef('exodus', 5)).toBe('exodus 5');
    });
  });

  describe('chapterPrefix', () => {
    it('returns a LIKE-compatible prefix', () => {
      expect(chapterPrefix('genesis', 1)).toBe('genesis 1:');
    });
  });

  describe('parseVerseRef', () => {
    it('parses a full verse ref', () => {
      expect(parseVerseRef('genesis 1:3')).toEqual({ bookId: 'genesis', ch: 1, v: 3 });
    });

    it('parses a chapter-only ref', () => {
      expect(parseVerseRef('exodus 5')).toEqual({ bookId: 'exodus', ch: 5 });
    });

    it('returns null for invalid input', () => {
      expect(parseVerseRef('')).toBeNull();
      expect(parseVerseRef('bad')).toBeNull();
    });
  });

  describe('extractVerseNum', () => {
    it('extracts the verse number', () => {
      expect(extractVerseNum('genesis 1:3')).toBe(3);
    });

    it('returns null for chapter-only ref', () => {
      expect(extractVerseNum('genesis 1')).toBeNull();
    });
  });

  describe('displayRef', () => {
    it('formats for display with title case', () => {
      expect(displayRef('genesis 1:3')).toBe('Genesis 1:3');
    });

    it('handles multi-word book names', () => {
      expect(displayRef('1_samuel 3:10')).toContain('3:10');
    });
  });
});
