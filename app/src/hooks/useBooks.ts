/**
 * hooks/useBooks.ts — Load all books with optional reading progress.
 */
import { useState, useEffect } from 'react';
import { getBooks, getLiveBooks } from '../db/content';
import { getUserDb } from '../db/userDatabase';
import type { Book } from '../types';

export interface BookWithProgress extends Book {
  chaptersRead: number;
}

export function useBooks() {
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [liveBooks, setLiveBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [all, live] = await Promise.all([getBooks(), getLiveBooks()]);

      // Fetch per-book progress counts from user.db
      let progressMap = new Map<string, number>();
      try {
        const rows = await getUserDb().getAllAsync<{ book_id: string; count: number }>(
          'SELECT book_id, COUNT(*) as count FROM reading_progress GROUP BY book_id'
        );
        progressMap = new Map(rows.map((r) => [r.book_id, r.count]));
      } catch {
        // user.db may not have data yet — fine
      }

      const enriched: BookWithProgress[] = all.map((b) => ({
        ...b,
        chaptersRead: progressMap.get(b.id) ?? 0,
      }));

      setBooks(enriched);
      setLiveBooks(live);
      setIsLoading(false);
    }
    load();
  }, []);

  return { books, liveBooks, isLoading };
}
