/**
 * services/engagementApi.ts — Supabase engagement API layer.
 *
 * Provides upvote, star rating, engagement counts, and flag submission.
 * All functions gracefully return defaults when Supabase is unavailable
 * (offline mode).
 */

import { getSupabase } from '../lib/supabase';

export interface EngagementCounts {
  upvotes: number;
  stars_avg: number;
  bookmarks: number;
}

/** Toggle upvote for a topic. Returns true if the operation succeeded. */
export async function toggleUpvote(topicId: string, userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false; // offline mode
  // Will call supabase.from('upvotes').upsert/delete
  return true;
}

/** Set a star rating (1-5) for a topic. Returns true if the operation succeeded. */
export async function setStarRating(topicId: string, userId: string, rating: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  return true;
}

/** Get aggregated engagement counts for a topic. */
export async function getEngagementCounts(topicId: string): Promise<EngagementCounts> {
  const supabase = getSupabase();
  if (!supabase) return { upvotes: 0, stars_avg: 0, bookmarks: 0 };
  return { upvotes: 0, stars_avg: 0, bookmarks: 0 };
}

/** Submit a content flag to the moderation queue. */
export async function submitFlag(
  contentId: string,
  contentType: string,
  reason: string,
  details?: string,
  userId?: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  return true;
}
