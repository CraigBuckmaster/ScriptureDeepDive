/**
 * hooks/useBooks.ts
 */
import { useState, useEffect } from 'react';
import { getBooks, getLiveBooks } from '../db/content';
import type { Book } from '../types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [liveBooks, setLiveBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBooks(), getLiveBooks()]).then(([all, live]) => {
      setBooks(all);
      setLiveBooks(live);
      setIsLoading(false);
    });
  }, []);

  return { books, liveBooks, isLoading };
}
