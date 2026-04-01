/**
 * useContentLibrary — Data hook for the Content Library screen.
 *
 * Loads category counts on mount, then fetches entries for the
 * active category with optional testament filter and search.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getContentLibraryCounts,
  getContentLibrary,
  searchContentLibrary,
} from '../db/content';
import { logger } from '../utils/logger';
import type { ContentLibraryEntry } from '../types';

export type ContentCategory = 'manuscripts' | 'discourse' | 'echoes' | 'ane' | 'chiasms';

const CATEGORY_ORDER: ContentCategory[] = [
  'manuscripts', 'discourse', 'echoes', 'ane', 'chiasms',
];

export function useContentLibrary() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [entries, setEntries] = useState<ContentLibraryEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<ContentCategory | null>(null);
  const [testament, setTestament] = useState<'ot' | 'nt' | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Categories with entries > 0, in display order
  const availableCategories = CATEGORY_ORDER.filter((c) => (counts[c] ?? 0) > 0);

  // Load counts on mount
  useEffect(() => {
    let cancelled = false;
    getContentLibraryCounts()
      .then((c) => {
        if (cancelled) return;
        setCounts(c);
        // Auto-select first available category
        const first = CATEGORY_ORDER.find((cat) => (c[cat] ?? 0) > 0);
        if (first) setActiveCategory(first);
        setIsLoading(false);
      })
      .catch((err) => {
        logger.error('useContentLibrary', 'Failed to load counts', err);
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Load entries when category/testament/search changes
  const loadEntries = useCallback(async () => {
    if (!activeCategory) {
      setEntries([]);
      return;
    }
    try {
      let results: ContentLibraryEntry[];
      if (searchQuery.trim()) {
        results = await searchContentLibrary(searchQuery.trim(), activeCategory);
        // Client-side testament filter for search results
        if (testament) {
          results = results.filter((e) => e.testament === testament);
        }
      } else {
        results = await getContentLibrary(activeCategory, testament);
      }
      setEntries(results);
    } catch (err) {
      logger.error('useContentLibrary', 'Failed to load entries', err);
    }
  }, [activeCategory, testament, searchQuery]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    counts,
    entries,
    availableCategories,
    activeCategory,
    setActiveCategory,
    testament,
    setTestament,
    searchQuery,
    setSearchQuery,
    isLoading,
  };
}
