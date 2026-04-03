/**
 * hooks/useFollowingFeed.ts — Fetches recent content from followed topics/users.
 *
 * Returns a feed of recent submissions related to targets the user follows.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores';
import { getFollowing } from '../services/socialApi';
import { getSupabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  target_id: string;
  target_type: string;
  author_name?: string;
  created_at: string;
}

export function useFollowingFeed() {
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const loadFeed = useCallback(async () => {
    if (!user) {
      setFeed([]);
      setFollowedIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const following = await getFollowing(user.id);
      const ids = following.map((f) => f.target_id);
      setFollowedIds(ids);

      if (ids.length === 0) {
        setFeed([]);
        setLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setFeed([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('id, title, body, target_id, target_type, author_name, created_at')
        .in('target_id', ids)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn('useFollowingFeed', 'Failed to fetch feed', error);
        setFeed([]);
      } else {
        setFeed(data ?? []);
      }
    } catch (err) {
      logger.warn('useFollowingFeed', 'Failed to load following feed', err);
      setFeed([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return { feed, loading, refresh: loadFeed, followedIds, hasFollows: followedIds.length > 0 };
}
