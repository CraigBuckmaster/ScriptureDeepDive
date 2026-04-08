/**
 * hooks/useSubmissionFeed.ts — Paginated feed of community submissions.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSupabase } from '../lib/supabase';
import type { Submission } from '../types';

const PAGE_SIZE = 20;
const LOAD_MORE_DEBOUNCE_MS = 300;

export function useSubmissionFeed(
  sort: 'newest' | 'top_rated',
  categoryId?: string,
) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const loadMoreTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchPage = useCallback(
    async (page: number, reset: boolean) => {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from('submissions')
          .select('*')
          .eq('status', 'approved')
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (categoryId) {
          query = query.eq('topic_id', categoryId);
        }

        if (sort === 'top_rated') {
          query = query.order('star_avg', { ascending: false }).order('upvote_count', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data } = await query;
        const rows = (data ?? []) as Submission[];

        if (reset) {
          setSubmissions(rows);
        } else {
          setSubmissions((prev) => [...prev, ...rows]);
        }
        setHasMore(rows.length === PAGE_SIZE);
      } catch {
        // gracefully degrade
      } finally {
        setLoading(false);
      }
    },
    [sort, categoryId],
  );

  useEffect(() => {
    pageRef.current = 0;
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    clearTimeout(loadMoreTimer.current);
    loadMoreTimer.current = setTimeout(() => {
      pageRef.current += 1;
      fetchPage(pageRef.current, false);
    }, LOAD_MORE_DEBOUNCE_MS);
  }, [loading, hasMore, fetchPage]);

  return { submissions, loading, loadMore, hasMore };
}
