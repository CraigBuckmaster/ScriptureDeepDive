/**
 * services/study/reviewNudge.ts — Review-due nudges (#1841).
 *
 * Due reviews surface as ONE quiet in-app notification per calendar
 * day. Rhythm tone on purpose: no urgency words, no missed-day counts.
 * OS push is out of scope — this only writes to app_notifications.
 */
import { getUserDb } from '../../db/userDatabase';
import { insertAppNotification } from '../../db/userMutations';
import { logger } from '../../utils/logger';

export const REVIEW_NUDGE_TYPE = 'review_due';

/** "3 review prompts are ready when you are." (grammatical for n=1). */
export function reviewNudgeBody(dueCount: number): string {
  return dueCount === 1
    ? '1 review prompt is ready when you are.'
    : `${dueCount} review prompts are ready when you are.`;
}

/**
 * Insert today's review nudge if there are due items and none exists
 * for today yet. Dedupe is double-layered: a query before insert (per
 * the card) plus a deterministic per-day id with INSERT OR IGNORE.
 * Returns true when a nudge was inserted.
 */
export async function maybeInsertReviewNudge(dueCount: number): Promise<boolean> {
  if (dueCount <= 0) return false;

  try {
    const db = getUserDb();
    const existing = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM app_notifications
       WHERE type = ? AND date(created_at) = date('now')
       LIMIT 1`,
      [REVIEW_NUDGE_TYPE],
    );
    if (existing) return false;

    const today = new Date().toISOString().slice(0, 10);
    await insertAppNotification({
      id: `review_due_${today}`,
      type: REVIEW_NUDGE_TYPE,
      title: 'Ready to revisit',
      body: reviewNudgeBody(dueCount),
      targetType: 'study_hub',
    });
    return true;
  } catch (err) {
    logger.warn('reviewNudge', 'Failed to insert review nudge', err);
    return false;
  }
}
