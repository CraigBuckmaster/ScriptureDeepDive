import { getNextChapter } from '../nextChapter';
import type { Book } from '../../../types';

function book(
  id: string,
  name: string,
  book_order: number,
  total_chapters: number,
  testament: 'ot' | 'nt' = 'ot',
): Book {
  return { id, name, testament, total_chapters, book_order, is_live: true };
}

const BOOKS: Book[] = [
  book('genesis', 'Genesis', 1, 50, 'ot'),
  book('exodus', 'Exodus', 2, 40, 'ot'),
  book('leviticus', 'Leviticus', 3, 27, 'ot'),
  book('matthew', 'Matthew', 40, 28, 'nt'),
  book('mark', 'Mark', 41, 16, 'nt'),
  book('jude', 'Jude', 65, 1, 'nt'),
  book('revelation', 'Revelation', 66, 22, 'nt'),
];

describe('getNextChapter', () => {
  it('advances to the next chapter within the same book', () => {
    expect(getNextChapter('genesis', 1, BOOKS)).toEqual({
      bookId: 'genesis',
      bookName: 'Genesis',
      chapterNum: 2,
    });
  });

  it('advances from the last chapter of one book to chapter 1 of the next', () => {
    expect(getNextChapter('genesis', 50, BOOKS)).toEqual({
      bookId: 'exodus',
      bookName: 'Exodus',
      chapterNum: 1,
    });
  });

  it('uses canonical book_order, not array order, when picking the next book', () => {
    const scrambled = [...BOOKS].reverse();
    expect(getNextChapter('exodus', 40, scrambled)).toEqual({
      bookId: 'leviticus',
      bookName: 'Leviticus',
      chapterNum: 1,
    });
  });

  it('handles single-chapter books like Jude correctly', () => {
    expect(getNextChapter('jude', 1, BOOKS)).toEqual({
      bookId: 'revelation',
      bookName: 'Revelation',
      chapterNum: 1,
    });
  });

  it('returns null at the end of Revelation', () => {
    expect(getNextChapter('revelation', 22, BOOKS)).toBeNull();
  });

  it('returns null when bookId is unknown', () => {
    expect(getNextChapter('not-a-book', 1, BOOKS)).toBeNull();
  });
});
