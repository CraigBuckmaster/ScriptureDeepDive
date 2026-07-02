/**
 * services/guidedStudy/reviewCopy.ts — Completion-payoff wording
 * (#1836). Derives "tomorrow"/"in N days" from the first rung of the
 * spaced-review ladder so the copy stays honest if
 * REVIEW_INTERVAL_DAYS ever changes.
 */
import { REVIEW_INTERVAL_DAYS } from './review';

/** "tomorrow" for a 1-day interval, otherwise "in N days". */
export function reviewReturnPhrase(days: number = REVIEW_INTERVAL_DAYS[0]): string {
  return days === 1 ? 'tomorrow' : `in ${days} days`;
}

/** The review-step save confirmation line. */
export function completionPayoffCopy(days: number = REVIEW_INTERVAL_DAYS[0]): string {
  return `Saved. You'll see this takeaway again ${reviewReturnPhrase(days)}.`;
}
