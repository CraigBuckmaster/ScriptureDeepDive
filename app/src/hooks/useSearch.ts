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

export function useSearch(
  query: string,
  testament?: 'ot' | 'nt' | null,
  bookId?: string | null,
) {
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
        const [verses, rawPeople] = await Promise.all([
          searchVerses(trimmed, 20, testament, bookId),
          searchPeople(trimmed),
        ]);

        // Sort people by relevance: direct name match → name contains → role/bio match
        const people = rawPeople.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aExact = aName === lower;
          const bExact = bName === lower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          const aStarts = aName.startsWith(lower);
          const bStarts = bName.startsWith(lower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          const aContains = aName.includes(lower);
          const bContains = bName.includes(lower);
          if (aContains && !bContains) return -1;
          if (!aContains && bContains) return 1;
          return 0; // both are role/bio matches — keep FTS order
        });

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
  }, [query, testament, bookId]);

  return { results, isLoading };
}
