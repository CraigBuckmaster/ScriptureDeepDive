/**
 * Database layer tests for db/content/books.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getBooks, getBook, getLiveBooks, getBookIntro } from '@/db/content/books';

beforeEach(() => resetMockDb());

describe('getBooks', () => {
  it('returns all books ordered by book_order', async () => {
    const books = [
      { id: 'gen', name: 'Genesis', book_order: 1 },
      { id: 'exo', name: 'Exodus', book_order: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(books);

    const result = await getBooks();
    expect(result).toEqual(books);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY book_order'),
    );
  });

  it('returns an empty array when no books exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getBooks();
    expect(result).toEqual([]);
  });
});

describe('getBook', () => {
  it('returns a single book by id', async () => {
    const book = { id: 'gen', name: 'Genesis', book_order: 1 };
    getMockDb().getFirstAsync.mockResolvedValue(book);

    const result = await getBook('gen');
    expect(result).toEqual(book);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['gen'],
    );
  });

  it('returns null when book not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getBook('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getLiveBooks', () => {
  it('returns only live books', async () => {
    const liveBooks = [{ id: 'gen', name: 'Genesis', is_live: 1, book_order: 1 }];
    getMockDb().getAllAsync.mockResolvedValue(liveBooks);

    const result = await getLiveBooks();
    expect(result).toEqual(liveBooks);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('is_live = 1'),
    );
  });
});

describe('getBookIntro', () => {
  it('returns a book intro for the given bookId', async () => {
    const intro = { id: 'intro-gen', book_id: 'gen', content: 'Genesis introduction...' };
    getMockDb().getFirstAsync.mockResolvedValue(intro);

    const result = await getBookIntro('gen');
    expect(result).toEqual(intro);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('book_intros'),
      ['gen'],
    );
  });

  it('returns null when no intro exists', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getBookIntro('unknown');
    expect(result).toBeNull();
  });
});
