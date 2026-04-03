/**
 * services/contentModeration.ts — AI pre-screening for community submissions.
 *
 * Calls a Supabase Edge Function to screen submission content before
 * it enters the moderation queue. Gracefully falls back to 'review'
 * when offline or the function is unavailable.
 */

import { getSupabase } from '../lib/supabase';

export interface ScreeningResult {
  decision: 'approve' | 'reject' | 'review';
  confidence: number;
  reason?: string;
}

/**
 * Screen a submission through the AI content moderation pipeline.
 * Returns a ScreeningResult indicating whether the content should be
 * auto-approved, rejected, or queued for human review.
 */
export async function screenSubmission(submission: {
  title: string;
  body: string;
  verses: string[];
}): Promise<ScreeningResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { decision: 'review', confidence: 0, reason: 'Offline' };
  }

  try {
    const { data } = await supabase.functions.invoke('screen-submission', {
      body: submission,
    });
    return data as ScreeningResult;
  } catch {
    return { decision: 'review', confidence: 0, reason: 'Screening unavailable' };
  }
}
