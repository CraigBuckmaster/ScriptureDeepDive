/**
 * useTopicData — Load all topics, group by category, FTS search with debounce.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { getTopics, searchTopics } from '../db/content';
import type { Topic } from '../types/topic';

const CATEGORY_LABELS: Record<string, string> = {
  theology: 'Theology',
  character: 'Character & Virtue',
  sin: 'Sin & Temptation',
  relationships: 'Relationships & Family',
  worship: 'Worship & Prayer',
  living: 'Christian Living',
  church: 'Church & Ministry',
  eschatology: 'End Times',
  creation: 'Creation & Nature',
  identity: 'Identity in Christ',
};

const CATEGORY_ORDER = [
  'theology', 'character', 'sin', 'relationships',
  'worship', 'living', 'church', 'eschatology', 'creation', 'identity',
];

export interface TopicSection {
  category: string;
  label: string;
  data: Topic[];
}

export interface UseTopicDataResult {
  sections: TopicSection[];
  categories: string[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  searchResults: Topic[];
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
}

export function useTopicData(): UseTopicDataResult {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getTopics().then((t) => {
      setTopics(t);
      setLoading(false);
    });
  }, []);

  // FTS search with debounce
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await searchTopics(search);
      setSearchResults(results);
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const filtered = useMemo(() => {
    let list = topics;
    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }
    return list;
  }, [topics, categoryFilter]);

  const sections = useMemo(() => {
    const groups = new Map<string, Topic[]>();
    for (const topic of filtered) {
      if (!groups.has(topic.category)) groups.set(topic.category, []);
      groups.get(topic.category)!.push(topic);
    }
    return CATEGORY_ORDER
      .filter((c) => groups.has(c))
      .map((c) => ({
        category: c,
        label: CATEGORY_LABELS[c] ?? c,
        data: groups.get(c)!,
      }));
  }, [filtered]);

  const categories = useMemo(() => {
    const uniqueCats = new Set(topics.map((t) => t.category));
    return CATEGORY_ORDER.filter((c) => uniqueCats.has(c));
  }, [topics]);

  const isSearching = search.length >= 2;

  return {
    sections,
    categories,
    loading,
    search,
    setSearch,
    searchResults: isSearching ? searchResults : [],
    categoryFilter,
    setCategoryFilter,
  };
}

export { CATEGORY_LABELS };
