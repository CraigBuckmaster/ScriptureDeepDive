/**
 * Spaced repetition ladder for guided study review prompts.
 *
 * Design: each prompt schedules ONE row at a time. When the user completes
 * a row, `completeGuidedReviewItem` inserts the next-interval row in the
 * same transaction. This ensures:
 *   - The user sees each prompt exactly once per interval, never a backlog
 *     of 3 identical prompts clustered between day 7 and day 30.
 *   - Skipping a row naturally breaks the chain (no phantom future rows).
 *   - `completeGuidedReviewItem` is the sole writer of follow-up rows.
 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 30] as const;

export type ReviewIntervalDay = (typeof REVIEW_INTERVAL_DAYS)[number];

/**
 * Builds the initial review items for a newly-completed synthesis. Each
 * prompt gets ONE row at the first interval (1 day). Subsequent intervals
 * are scheduled progressively by `completeGuidedReviewItem` as the user
 * completes each row.
 */
export function buildReviewItemsFromSynthesis(synthesis: {
  takeaway: string;
  open_question: string;
  key_connection: string;
}): Array<{ prompt: string; answer: string; intervalDays: number }> {
  const baseItems = [
    {
      prompt: 'What was your main takeaway from this study session?',
      answer: synthesis.takeaway,
    },
    {
      prompt: 'What question should you revisit from this passage?',
      answer: synthesis.open_question,
    },
    {
      prompt: 'What key connection did this chapter reveal?',
      answer: synthesis.key_connection,
    },
  ].filter((item) => item.answer.trim().length > 0);

  return baseItems.map((item) => ({
    ...item,
    intervalDays: REVIEW_INTERVAL_DAYS[0],
  }));
}

/**
 * Given the interval_days of a row that was just completed, returns the
 * next interval to schedule, or null if we've reached the end of the ladder.
 */
export function nextIntervalAfter(currentIntervalDays: number): number | null {
  const idx = REVIEW_INTERVAL_DAYS.indexOf(currentIntervalDays as ReviewIntervalDay);
  if (idx === -1 || idx === REVIEW_INTERVAL_DAYS.length - 1) return null;
  return REVIEW_INTERVAL_DAYS[idx + 1];
}
