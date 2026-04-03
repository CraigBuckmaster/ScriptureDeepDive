/**
 * useThreads — Hooks for fetching cross-reference thread data.
 */

import { useState, useEffect } from 'react';
import { getCrossRefThreads, getCrossRefThread } from '../db/content';
import type { CrossRefThread } from '../types';
import { logger } from '../utils/logger';

export interface ParsedThread {
  id: string;
  theme: string;
  tags: string[];
  steps: ChainStep[];
}

export interface ChainStep {
  ref: string;
  note: string;
}

function parseThread(thread: CrossRefThread): ParsedThread {
  let tags: string[] = [];
  let steps: ChainStep[] = [];
  try {
    tags = thread.tags_json ? JSON.parse(thread.tags_json) : [];
  } catch { /* empty */ }
  try {
    steps = JSON.parse(thread.steps_json);
  } catch { /* empty */ }
  return { id: thread.id, theme: thread.theme, tags, steps };
}

export function useThreads() {
  const [threads, setThreads] = useState<ParsedThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCrossRefThreads()
      .then((raw) => setThreads(raw.map(parseThread)))
      .catch((err) => logger.error('useThreads', 'Failed to load threads', err))
      .finally(() => setIsLoading(false));
  }, []);

  return { threads, isLoading };
}

export function useThreadDetail(threadId: string) {
  const [thread, setThread] = useState<ParsedThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (threadId) {
      getCrossRefThread(threadId)
        .then((raw) => setThread(raw ? parseThread(raw) : null))
        .catch((err) => logger.error('useThreadDetail', 'Failed to load thread', err))
        .finally(() => setIsLoading(false));
    }
  }, [threadId]);

  return { thread, isLoading };
}
