/**
 * services/socialApi.ts — Supabase social API layer.
 *
 * Provides follow/unfollow, follower counts, and following lists.
 * All functions gracefully return defaults when Supabase is unavailable
 * (offline mode).
 */

import { getSupabase } from '../lib/supabase';

export type FollowTargetType = 'topic' | 'user';

export interface FollowRecord {
  target_id: string;
  target_type: FollowTargetType;
  followed_at: string;
}

/** Follow a target (topic or user). Returns true if the operation succeeded. */
export async function followTarget(
  targetId: string,
  targetType: FollowTargetType,
  userId: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false; // offline mode

  try {
    const { error } = await supabase.from('follows').upsert(
      { user_id: userId, target_id: targetId, target_type: targetType },
      { onConflict: 'user_id,target_id,target_type' },
    );
    return !error;
  } catch {
    return false;
  }
}

/** Unfollow a target. Returns true if the operation succeeded. */
export async function unfollowTarget(
  targetId: string,
  targetType: FollowTargetType,
  userId: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ user_id: userId, target_id: targetId, target_type: targetType });
    return !error;
  } catch {
    return false;
  }
}

/** Get all targets a user is following. */
export async function getFollowing(userId: string): Promise<FollowRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('follows')
      .select('target_id, target_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((row: any) => ({
      target_id: row.target_id,
      target_type: row.target_type,
      followed_at: row.created_at,
    }));
  } catch {
    return [];
  }
}

/** Get the follower count for a target. */
export async function getFollowers(targetId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', targetId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
