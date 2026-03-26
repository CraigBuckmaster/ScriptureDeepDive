/**
 * hooks/useSearch.ts — Combined search across verses, people, and word studies.
 * Debounced at 300ms to avoid hammering FTS on every keystroke.
 */

import { useState, useEffect, useRef } from 'react';
import { searchVerses, searchPeople, getAllWordStudies } from '../db/content';
import type { Verse, Person, WordStudy } from '../types';
import { logger } from '../utils/logger';

interface SearchResults {
  verses: Verse[];
  people: Person[];
  wordStudies: WordStudy[];
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResults>({ verses: [], people: [], wordStudies: [] });
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordStudyCache = useRef<WordStudy[]>([]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ verses: [], people: [], wordStudies: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        // Lazy-load word studies cache
        if (wordStudyCache.current.length === 0) {
          wordStudyCache.current = await getAllWordStudies();
        }

        const lower = trimmed.toLowerCase();
        const [verses, people] = await Promise.all([
          searchVerses(trimmed, 20),
          searchPeople(trimmed),
        ]);

        // Filter word studies client-side (only 14 entries — no FTS needed)
        const wordStudies = wordStudyCache.current.filter((ws) =>
          ws.transliteration.toLowerCase().includes(lower) ||
          ws.original.includes(trimmed) ||
          ws.id.toLowerCase().includes(lower)
        );

        setResults({ verses, people, wordStudies });
      } catch (err) {
        setResults({ verses: [], people: [], wordStudies: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, isLoading };
}
