/**
 * services/trustLevel.ts — Trust level calculation and retrieval.
 *
 * Users earn trust through positive contributions and lose it
 * through moderation actions. Three tiers: New (0), Trusted (1),
 * Verified (2).
 */

import { getSupabase } from '../lib/supabase';

export interface TrustScore {
  level: 0 | 1 | 2;
  score: number;
  label: string;
}

export const TRUST_LABELS: Record<0 | 1 | 2, string> = {
  0: 'New',
  1: 'Trusted',
  2: 'Verified',
};

export const SCORE_EVENTS: Record<string, number> = {
  submission_approved: 10,
  submission_rejected: -15,
  received_upvote: 1,
  flag_upheld: -25,
};

/**
 * Pure function: determine trust level from score, account age, and
 * recent flag count.
 */
export function calculateTrustLevel(
  score: number,
  accountAgeDays: number,
  recentFlags: number,
): 0 | 1 | 2 {
  if (score >= 200 && accountAgeDays >= 60 && recentFlags === 0) return 2;
  if (score >= 100 && accountAgeDays >= 30 && recentFlags === 0) return 1;
  return 0;
}

/**
 * Fetch trust score for a user from Supabase.
 * Falls back to level 0 when offline.
 */
export async function getUserTrustScore(userId: string): Promise<TrustScore> {
  const supabase = getSupabase();
  if (!supabase) {
    return { level: 0, score: 0, label: TRUST_LABELS[0] };
  }

  try {
    const { data } = await supabase
      .from('user_trust_scores')
      .select('score, account_age_days, recent_flags')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return { level: 0, score: 0, label: TRUST_LABELS[0] };
    }

    const level = calculateTrustLevel(data.score, data.account_age_days, data.recent_flags);
    return { level, score: data.score, label: TRUST_LABELS[level] };
  } catch {
    return { level: 0, score: 0, label: TRUST_LABELS[0] };
  }
}
