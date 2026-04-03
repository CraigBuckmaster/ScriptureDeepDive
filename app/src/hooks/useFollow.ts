/**
 * hooks/useFollow.ts — Follow/unfollow state for a target.
 *
 * Manages optimistic UI updates and syncs with Supabase via socialApi.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores';
import * as socialApi from '../services/socialApi';
import type { FollowTargetType } from '../services/socialApi';
import { logger } from '../utils/logger';

export function useFollow(targetId: string, targetType: FollowTargetType) {
  const user = useAuthStore((s) => s.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [following, count] = await Promise.all([
          user ? socialApi.getFollowing(user.id) : Promise.resolve([]),
          socialApi.getFollowers(targetId),
        ]);

        if (cancelled) return;

        const isCurrentlyFollowing = following.some(
          (f) => f.target_id === targetId && f.target_type === targetType,
        );
        setIsFollowing(isCurrentlyFollowing);
        setFollowerCount(count);
      } catch (err) {
        logger.warn('useFollow', 'Failed to load follow state', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [targetId, targetType, user]);

  const toggle = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((prev) => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

    const success = wasFollowing
      ? await socialApi.unfollowTarget(targetId, targetType, user.id)
      : await socialApi.followTarget(targetId, targetType, user.id);

    if (!success) {
      // Revert on failure
      setIsFollowing(wasFollowing);
      setFollowerCount((prev) => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
      logger.warn('useFollow', 'Toggle failed, reverted');
    }
  }, [user, targetId, targetType, isFollowing]);

  return { isFollowing, toggle, followerCount, loading };
}
