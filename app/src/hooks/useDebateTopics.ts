/**
 * useDebateTopics — Hooks for Scholar Debate Mode data loading.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  getDebateTopics, getDebateTopic, getDebateTopicsForChapter,
  searchDebateTopics, getDebateTopicScholars,
} from '../db/content';
import type { DebateTopicSummary, DebateTopic, Scholar } from '../types';
import { logger } from '../utils/logger';

// ── Category constants ────────────────────────────────────────

export const DEBATE_CATEGORY_LABELS: Record<string, string> = {
  theological: 'Theological',
  ethical: 'Ethical',
  historical: 'Historical',
  textual: 'Textual',
  interpretive: 'Interpretive',
};

const CATEGORY_ORDER = ['theological', 'ethical', 'historical', 'textual', 'interpretive'];

// ── Browse hook ───────────────────────────────────────────────

export interface UseDebateTopicsResult {
  topics: DebateTopicSummary[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  searchResults: DebateTopicSummary[];
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  categories: string[];
}

export function useDebateTopics(): UseDebateTopicsResult {
  const [allTopics, setAllTopics] = useState<DebateTopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DebateTopicSummary[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getDebateTopics()
      .then((t) => {
        setAllTopics(t);
        setLoading(false);
      })
      .catch((err) => {
        logger.error('useDebateTopics', 'Failed to load debate topics', err);
        setLoading(false);
      });
  }, []);

  // Debounced search
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchDebateTopics(search);
      if (!cancelled) setSearchResults(results);
    }, 200);
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const topics = useMemo(() => {
    if (categoryFilter === 'all') return allTopics;
    return allTopics.filter((t) => t.category === categoryFilter);
  }, [allTopics, categoryFilter]);

  const categories = useMemo(() => {
    const uniqueCats = new Set(allTopics.map((t) => t.category));
    return CATEGORY_ORDER.filter((c) => uniqueCats.has(c));
  }, [allTopics]);

  const isSearching = search.length >= 2;

  return {
    topics: isSearching ? searchResults : topics,
    loading,
    search, setSearch,
    searchResults: isSearching ? searchResults : [],
    categoryFilter, setCategoryFilter,
    categories,
  };
}

// ── Detail hook ───────────────────────────────────────────────

export interface UseDebateTopicResult {
  topic: DebateTopic | null;
  scholars: Map<string, Scholar>;
  loading: boolean;
}

export function useDebateTopic(topicId: string): UseDebateTopicResult {
  const [topic, setTopic] = useState<DebateTopic | null>(null);
  const [scholars, setScholars] = useState<Map<string, Scholar>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [t, linkedScholars] = await Promise.all([
        getDebateTopic(topicId),
        getDebateTopicScholars(topicId),
      ]);
      if (cancelled) return;
      setTopic(t);
      const map = new Map<string, Scholar>();
      for (const s of linkedScholars) map.set(s.id, s);
      setScholars(map);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [topicId]);

  return { topic, scholars, loading };
}

// ── Chapter hook (for inline entry point) ─────────────────────

export function useChapterDebateTopics(
  bookId: string | null, chapterNum: number,
): DebateTopicSummary[] {
  const [topics, setTopics] = useState<DebateTopicSummary[]>([]);

  useEffect(() => {
    if (!bookId) {
      setTopics([]);
      return;
    }
    let cancelled = false;
    getDebateTopicsForChapter(bookId, chapterNum).then((t) => {
      if (!cancelled) setTopics(t);
    });
    return () => { cancelled = true; };
  }, [bookId, chapterNum]);

  return topics;
}
