/**
 * hooks/useLifeTopics.ts — Data hooks for Life Topics feature.
 *
 * Provides category listing, topic browsing (with optional category filter),
 * full-text search, and detail view with verses + scholars + related topics.
 */

import { useState, useEffect, useRef } from 'react';
import {
  getLifeTopicCategories,
  getLifeTopics,
  getLifeTopic,
  searchLifeTopics,
  getLifeTopicVerses,
  getLifeTopicScholars,
  getRelatedLifeTopics,
} from '../db/content/lifeTopics';
import type { LifeTopicCategory, LifeTopic } from '../types';
import { useAsyncData } from './useAsyncData';

export function useLifeTopicCategories() {
  return useAsyncData<LifeTopicCategory[]>(getLifeTopicCategories, [], []);
}

export function useLifeTopics(categoryId?: string) {
  return useAsyncData<LifeTopic[]>(
    () => getLifeTopics(categoryId),
    [categoryId],
    [],
  );
}

export function useLifeTopicSearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<LifeTopic[]>([]);
  const [searching, setSearching] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchLifeTopics(search)
        .then((r) => {
          if (mountedRef.current) {
            setResults(r);
            setSearching(false);
          }
        })
        .catch(() => {
          if (mountedRef.current) setSearching(false);
        });
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return { search, setSearch, results, searching };
}

export interface LifeTopicDetailData {
  topic: LifeTopic | null;
  verses: Record<string, unknown>[];
  scholars: Record<string, unknown>[];
  related: LifeTopic[];
  loading: boolean;
}

export function useLifeTopicDetail(topicId: string): LifeTopicDetailData {
  const [topic, setTopic] = useState<LifeTopic | null>(null);
  const [verses, setVerses] = useState<Record<string, unknown>[]>([]);
  const [scholars, setScholars] = useState<Record<string, unknown>[]>([]);
  const [related, setRelated] = useState<LifeTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      getLifeTopic(topicId),
      getLifeTopicVerses(topicId),
      getLifeTopicScholars(topicId),
      getRelatedLifeTopics(topicId),
    ])
      .then(([t, v, s, r]) => {
        if (mountedRef.current) {
          setTopic(t);
          setVerses(v as Record<string, unknown>[]);
          setScholars(s as Record<string, unknown>[]);
          setRelated(r);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [topicId]);

  return { topic, verses, scholars, related, loading };
}
