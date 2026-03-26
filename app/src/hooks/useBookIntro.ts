import { useState, useEffect } from 'react';
import { getBookIntro } from '../db/content';
import { safeParse } from '../utils/logger';

export function useBookIntro(bookId: string | null) {
  const [intro, setIntro] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    getBookIntro(bookId).then((row) => {
      setIntro(row ? safeParse(row.intro_json, null, 'useBookIntro') : null);
      setIsLoading(false);
    });
  }, [bookId]);

  return { intro, isLoading };
}
