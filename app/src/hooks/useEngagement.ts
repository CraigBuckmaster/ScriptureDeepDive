/**
 * hooks/useEngagement.ts — Engagement state for a life topic.
 *
 * Provides upvote toggle, star rating, and aggregated counts with
 * optimistic local updates. Calls engagementApi in the background;
 * if Supabase is unavailable the local state still works.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  toggleUpvote as apiToggleUpvote,
  setStarRating as apiSetStarRating,
  getEngagementCounts,
  type EngagementCounts,
} from '../services/engagementApi';

interface UseEngagementResult {
  counts: EngagementCounts;
  isUpvoted: boolean;
  toggleUpvote: () => void;
  rating: number;
  setRating: (r: number) => void;
  isLoading: boolean;
}

export function useEngagement(topicId: string, userId?: string): UseEngagementResult {
  const [counts, setCounts] = useState<EngagementCounts>({ upvotes: 0, stars_avg: 0, bookmarks: 0 });
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [rating, setRatingLocal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial counts
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    getEngagementCounts(topicId).then((c) => {
      if (!cancelled) {
        setCounts(c);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [topicId]);

  const toggleUpvote = useCallback(() => {
    const next = !isUpvoted;
    // Optimistic update
    setIsUpvoted(next);
    setCounts((prev) => ({
      ...prev,
      upvotes: prev.upvotes + (next ? 1 : -1),
    }));
    // Fire-and-forget API call
    if (userId) {
      apiToggleUpvote(topicId, userId);
    }
  }, [isUpvoted, topicId, userId]);

  const setRating = useCallback(
    (r: number) => {
      // Optimistic update
      setRatingLocal(r);
      // Fire-and-forget API call
      if (userId) {
        apiSetStarRating(topicId, userId, r);
      }
    },
    [topicId, userId],
  );

  return { counts, isUpvoted, toggleUpvote, rating, setRating, isLoading };
}
