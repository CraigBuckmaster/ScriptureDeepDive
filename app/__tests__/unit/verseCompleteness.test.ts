/**
 * Tests for verse file completeness across all live books and translations.
 * Validates that every live book in books.json has corresponding verse files
 * in NIV, ESV, and KJV directories with the correct structure.
 */

import * as fs from 'fs';
import * as path from 'path';

const CONTENT_DIR = path.resolve(__dirname, '../../..', 'content');

interface Book {
  id: string;
  name: string;
  book_order: number;
  is_live: boolean;
}

function loadBooks(): Book[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, 'meta', 'books.json'), 'utf-8');
  return JSON.parse(raw);
}

function getLiveBooks(): Book[] {
  return loadBooks().filter((b) => b.is_live);
}

describe('verse file completeness', () => {
  const liveBooks = getLiveBooks();

  it('every live book has a verse file in content/verses/niv/', () => {
    const missing: string[] = [];
    for (const book of liveBooks) {
      const filePath = path.join(CONTENT_DIR, 'verses', 'niv', `${book.id}.json`);
      if (!fs.existsSync(filePath)) {
        missing.push(book.id);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every live book has a verse file in content/verses/esv/', () => {
    const missing: string[] = [];
    for (const book of liveBooks) {
      const filePath = path.join(CONTENT_DIR, 'verses', 'esv', `${book.id}.json`);
      if (!fs.existsSync(filePath)) {
        missing.push(book.id);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every live book has a verse file in content/verses/kjv/', () => {
    const missing: string[] = [];
    for (const book of liveBooks) {
      const filePath = path.join(CONTENT_DIR, 'verses', 'kjv', `${book.id}.json`);
      if (!fs.existsSync(filePath)) {
        missing.push(book.id);
      }
    }
    expect(missing).toEqual([]);
  });

  it('NIV verse files contain entries with required fields: ref, text, book, ch, v', () => {
    const errors: string[] = [];
    for (const book of liveBooks) {
      const filePath = path.join(CONTENT_DIR, 'verses', 'niv', `${book.id}.json`);
      if (!fs.existsSync(filePath)) continue;
      const verses = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (!Array.isArray(verses) || verses.length === 0) {
        errors.push(`${book.id}: file is empty or not an array`);
        continue;
      }
      for (let i = 0; i < verses.length; i++) {
        const entry = verses[i];
        const missing: string[] = [];
        for (const field of ['ref', 'text', 'book', 'ch', 'v']) {
          if (entry[field] === undefined || entry[field] === null) {
            missing.push(field);
          }
        }
        if (missing.length > 0) {
          errors.push(`${book.id}[${i}]: missing ${missing.join(', ')}`);
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it('books.json has valid book_order values (sequential, no duplicates)', () => {
    const allBooks = loadBooks();
    const orders = allBooks.map((b) => b.book_order);
    const uniqueOrders = new Set(orders);

    // No duplicates
    expect(uniqueOrders.size).toBe(orders.length);

    // Sequential starting from 1
    const sorted = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      expect(sorted[i]).toBe(i + 1);
    }
  });
});
