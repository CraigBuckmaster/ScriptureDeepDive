/**
 * db/content/books.ts — Book and book intro queries.
 */

import { getDb } from '../database';
import type { Book, BookIntro } from '../../types';

export async function getBooks(): Promise<Book[]> {
  return getDb().getAllAsync<Book>(
    'SELECT * FROM books ORDER BY book_order'
  );
}

export async function getBook(id: string): Promise<Book | null> {
  return getDb().getFirstAsync<Book>(
    'SELECT * FROM books WHERE id = ?', [id]
  );
}

export async function getLiveBooks(): Promise<Book[]> {
  return getDb().getAllAsync<Book>(
    'SELECT * FROM books WHERE is_live = 1 ORDER BY book_order'
  );
}

export async function getBookIntro(bookId: string): Promise<BookIntro | null> {
  return getDb().getFirstAsync<BookIntro>(
    'SELECT * FROM book_intros WHERE book_id = ?', [bookId]
  );
}
