/**
 * useExtraBiblical — Hook for the Extra-Biblical Index screen
 * (HWGTB-P2-02 / #1547). Loads all entries once, debounces the search
 * input, and filters client-side by category.
 *
 * Mirrors the useDebateTopics pattern so the Index screen stays thin.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getAllExtraBiblical,
  searchExtraBiblical,
} from '../db/content';
import type { ExtrabiblicalCategory, ExtrabiblicalSummary } from '../types';
import { logger } from '../utils/logger';

export const EXTRABIBLICAL_CATEGORY_LABELS: Record<ExtrabiblicalCategory, string> = {
  apocrypha: 'Apocrypha',
  pseudepigrapha: 'Pseudepigrapha',
  dss: 'Dead Sea Scrolls',
  deuterocanon: 'Deuterocanon',
};

const CATEGORY_ORDER: ExtrabiblicalCategory[] = [
  'deuterocanon',
  'pseudepigrapha',
  'dss',
  'apocrypha',
];

export type ExtrabiblicalFilter = ExtrabiblicalCategory | 'all';

export interface UseExtraBiblicalResult {
  entries: ExtrabiblicalSummary[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: ExtrabiblicalFilter;
  setCategoryFilter: (c: ExtrabiblicalFilter) => void;
  /** Category keys actually present in the data, in display order. */
  categories: ExtrabiblicalCategory[];
}

export function useExtraBiblical(): UseExtraBiblicalResult {
  const [allEntries, setAllEntries] = useState<ExtrabiblicalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ExtrabiblicalSummary[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ExtrabiblicalFilter>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    getAllExtraBiblical()
      .then((rows) => {
        if (!cancelled) {
          setAllEntries(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        logger.error('useExtraBiblical', 'Failed to load extrabiblical entries', err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search — mirrors useDebateTopics (200ms).
  useEffect(() => {
    if (search.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchExtraBiblical(search);
        if (!cancelled) setSearchResults(results);
      } catch (err) {
        logger.error('useExtraBiblical', 'Search failed', err);
      }
    }, 200);
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return allEntries;
    return allEntries.filter((e) => e.category === categoryFilter);
  }, [allEntries, categoryFilter]);

  const categories = useMemo(() => {
    const present = new Set(
      allEntries
        .map((e) => e.category)
        .filter((c): c is ExtrabiblicalCategory => c !== null),
    );
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [allEntries]);

  const isSearching = search.trim().length >= 2;
  const entries = isSearching
    ? (categoryFilter === 'all'
        ? searchResults
        : searchResults.filter((e) => e.category === categoryFilter))
    : filtered;

  return {
    entries,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
  };
}
