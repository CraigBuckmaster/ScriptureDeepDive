import type { Book } from '../../types';

export interface NextChapterRef {
  bookId: string;
  bookName: string;
  chapterNum: number;
}

/**
 * Given the current chapter, return the next one in canonical order.
 *
 * - Same book if `chapterNum + 1` is within `total_chapters`.
 * - Otherwise the next book by `book_order`, chapter 1.
 * - `null` at the end of the canon (e.g. Revelation 22) — caller renders
 *   a "Start over from Genesis 1" celebratory card.
 *
 * Pure: takes the books list as a parameter so the function is trivial
 * to test without DB access.
 */
export function getNextChapter(
  bookId: string,
  chapterNum: number,
  books: Book[],
): NextChapterRef | null {
  const current = books.find((b) => b.id === bookId);
  if (!current) return null;

  if (chapterNum < current.total_chapters) {
    return { bookId: current.id, bookName: current.name, chapterNum: chapterNum + 1 };
  }

  const next = books
    .filter((b) => b.book_order > current.book_order)
    .sort((a, b) => a.book_order - b.book_order)[0];

  if (!next) return null;
  return { bookId: next.id, bookName: next.name, chapterNum: 1 };
}
