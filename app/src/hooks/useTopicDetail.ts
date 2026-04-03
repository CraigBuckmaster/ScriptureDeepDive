/**
 * useTopicDetail — Load a single topic and resolve cross-link IDs to full objects.
 */

import { useState, useEffect } from 'react';
import { getTopic, getConcept, getCrossRefThread, getProphecyChain } from '../db/content';
import type { Topic } from '../types/topic';
import type { Concept, CrossRefThread, ProphecyChain } from '../types';

export interface UseTopicDetailResult {
  topic: Topic | null;
  relatedConcepts: { id: string; title: string }[];
  relatedThreads: { id: string; theme: string }[];
  relatedProphecyChains: { id: string; title: string }[];
  loading: boolean;
}

export function useTopicDetail(topicId: string): UseTopicDetailResult {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedConcepts, setRelatedConcepts] = useState<{ id: string; title: string }[]>([]);
  const [relatedThreads, setRelatedThreads] = useState<{ id: string; theme: string }[]>([]);
  const [relatedProphecyChains, setRelatedProphecyChains] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const t = await getTopic(topicId);
      if (cancelled || !t) {
        if (!cancelled) setLoading(false);
        return;
      }
      setTopic(t);

      // Resolve cross-links in parallel
      const conceptIds: string[] = safeParseArray(t.related_concept_ids_json);
      const threadIds: string[] = safeParseArray(t.related_thread_ids_json);
      const prophecyIds: string[] = safeParseArray(t.related_prophecy_ids_json);

      const [concepts, threads, prophecies] = await Promise.all([
        Promise.all(conceptIds.map((id) => getConcept(id))),
        Promise.all(threadIds.map((id) => getCrossRefThread(id))),
        Promise.all(prophecyIds.map((id) => getProphecyChain(id))),
      ]);

      if (cancelled) return;

      setRelatedConcepts(
        concepts.filter(Boolean).map((c) => ({ id: (c as Concept).id, title: (c as Concept).name }))
      );
      setRelatedThreads(
        threads.filter(Boolean).map((t) => ({ id: (t as CrossRefThread).id, theme: (t as CrossRefThread).theme }))
      );
      setRelatedProphecyChains(
        prophecies.filter(Boolean).map((p) => ({ id: (p as ProphecyChain).id, title: (p as ProphecyChain).title }))
      );
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [topicId]);

  return { topic, relatedConcepts, relatedThreads, relatedProphecyChains, loading };
}

function safeParseArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
