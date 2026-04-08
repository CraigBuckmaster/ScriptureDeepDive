/**
 * services/engagementApi.ts — Supabase engagement API layer.
 *
 * Provides upvote, star rating, engagement counts, and flag submission.
 * When Supabase is unavailable (offline), mutations are queued via
 * syncQueue for later delivery.
 *
 * Flag submissions include server-side rate limiting (5/user/hour)
 * enforced by RLS policy, with a client-side pre-check for UX.
 */

import { getSupabase } from '../lib/supabase';
import { getCurrentSession } from './auth';
import { enqueue } from './syncQueue';
import { flagContent as flagContentLocally } from '../db/userMutations';
import { logger } from '../utils/logger';

export interface EngagementCounts {
  upvotes: number;
  stars_avg: number;
  bookmarks: number;
}

/** Toggle upvote for a topic. Returns true if the operation succeeded or was queued. */
export async function toggleUpvote(topicId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    await enqueue('toggle_upvote', { topic_id: topicId, user_id: userId });
    return true;
  }

  try {
    // Check if already upvoted
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .match({ user_id: userId, topic_id: topicId })
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .match({ user_id: userId, topic_id: topicId });
      return !error;
    }

    const { error } = await supabase.from('upvotes').insert({
      user_id: userId,
      topic_id: topicId,
    });
    return !error;
  } catch {
    await enqueue('toggle_upvote', { topic_id: topicId, user_id: userId });
    return true;
  }
}

/** Set a star rating (1-5) for a topic. Returns true if the operation succeeded or was queued. */
export async function setStarRating(topicId: string, userId: string, rating: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    await enqueue('set_star_rating', { topic_id: topicId, user_id: userId, rating });
    return true;
  }

  try {
    const { error } = await supabase.from('star_ratings').upsert(
      { user_id: userId, topic_id: topicId, rating },
      { onConflict: 'user_id,topic_id' },
    );
    return !error;
  } catch {
    await enqueue('set_star_rating', { topic_id: topicId, user_id: userId, rating });
    return true;
  }
}

/** Get aggregated engagement counts for a topic. */
export async function getEngagementCounts(topicId: string): Promise<EngagementCounts> {
  const supabase = getSupabase();
  if (!supabase) return { upvotes: 0, stars_avg: 0, bookmarks: 0 };

  try {
    const [upvoteRes, ratingRes] = await Promise.all([
      supabase
        .from('upvotes')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topicId),
      supabase
        .from('star_ratings')
        .select('rating')
        .eq('topic_id', topicId),
    ]);

    const upvotes = upvoteRes.count ?? 0;
    const ratings: { rating: number }[] = ratingRes.data ?? [];
    const stars_avg = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return { upvotes, stars_avg, bookmarks: 0 };
  } catch {
    return { upvotes: 0, stars_avg: 0, bookmarks: 0 };
  }
}

/**
 * Submit a content flag to the moderation queue.
 *
 * 1. Always stores locally (for offline access and audit).
 * 2. If online, submits to Supabase (rate-limited server-side at 5/user/hour).
 * 3. If offline, enqueues for later sync.
 *
 * Returns { success, rateLimited } so the UI can show appropriate feedback.
 */
export async function submitFlag(
  contentId: string,
  contentType: string,
  reason: string,
  details?: string,
): Promise<{ success: boolean; rateLimited?: boolean }> {
  // Always save locally first
  await flagContentLocally(contentId, contentType, reason, details);

  const supabase = getSupabase();
  const user = await getCurrentSession();
  const userId = user?.id;

  if (!supabase || !userId) {
    // Offline or not authenticated — queue for later
    await enqueue('submit_flag', {
      content_id: contentId,
      content_type: contentType,
      reason,
      details,
      user_id: userId,
    });
    return { success: true };
  }

  try {
    // Client-side rate-limit check (server also enforces via RLS)
    const { data: count } = await supabase.rpc('get_user_flag_count_last_hour', {
      uid: userId,
    });
    if (typeof count === 'number' && count >= 5) {
      logger.warn('EngagementApi', 'Flag rate limit reached');
      return { success: false, rateLimited: true };
    }

    const { error } = await supabase.from('content_flags').insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      reason,
      details: details ?? null,
    });

    if (error) {
      // If server rejects (e.g. rate limit RLS), queue for retry
      if (error.code === '42501') {
        return { success: false, rateLimited: true };
      }
      logger.warn('EngagementApi', 'Flag submit failed, queuing', error);
      await enqueue('submit_flag', {
        content_id: contentId,
        content_type: contentType,
        reason,
        details,
        user_id: userId,
      });
      return { success: true };
    }

    // Mark local copy as synced
    try {
      const { getUserDb } = require('../db/userDatabase');
      await getUserDb().runAsync(
        'UPDATE flagged_content SET synced = 1 WHERE content_id = ? AND content_type = ?',
        [contentId, contentType],
      );
    } catch {
      // Non-critical — local flag is still stored
    }

    return { success: true };
  } catch {
    await enqueue('submit_flag', {
      content_id: contentId,
      content_type: contentType,
      reason,
      details,
      user_id: userId,
    });
    return { success: true };
  }
}
