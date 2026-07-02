/**
 * services/study/progression.ts — Where-am-I helpers over unified
 * study plans (#1831).
 *
 * All state lives in `study_plans` / `study_plan_items` (user.db,
 * migration v25); these helpers only read via db/userQueries.
 */
import {
  getGuidedStudySession,
  getStudyPlanItems,
  getStudyPlans,
} from '../../db/userQueries';
import type { GuidedStudyStep, StudyPlan, StudyPlanItem, StudyPlanItemRef } from '../../types';
import { logger } from '../../utils/logger';

export interface ResumeTarget {
  bookId: string;
  chapterNum: number;
  /** Present when the next item already has an in-flight guided session. */
  step?: GuidedStudyStep;
}

function parseItemRef(item: StudyPlanItem): StudyPlanItemRef | null {
  try {
    const ref: unknown = JSON.parse(item.ref_json);
    if (
      typeof ref === 'object' &&
      ref !== null &&
      typeof (ref as StudyPlanItemRef).bookId === 'string' &&
      typeof (ref as StudyPlanItemRef).chapterNum === 'number'
    ) {
      return ref as StudyPlanItemRef;
    }
  } catch (err) {
    logger.warn(
      'studyPlans',
      `parseItemRef: bad ref_json on plan ${item.plan_id} item ${item.item_num}`,
      err,
    );
  }
  return null;
}

/**
 * The plan the Study hub should surface: the newest non-archived plan
 * that still has an incomplete item. Fully-completed plans are never
 * "active"; returns null when there is nothing to continue.
 */
export async function getActivePlan(): Promise<StudyPlan | null> {
  const plans = await getStudyPlans();
  for (const plan of plans) {
    const items = await getStudyPlanItems(plan.id);
    if (items.some((item) => item.completed_at == null)) return plan;
  }
  return null;
}

/** First incomplete item of the plan (by item_num), or null when done/empty. */
export async function getNextItem(planId: string): Promise<StudyPlanItem | null> {
  const items = await getStudyPlanItems(planId);
  return items.find((item) => item.completed_at == null) ?? null;
}

/** Whole-number completion percentage (0–100). Empty plans read as 0. */
export async function percentComplete(planId: string): Promise<number> {
  const items = await getStudyPlanItems(planId);
  if (items.length === 0) return 0;
  const done = items.filter((item) => item.completed_at != null).length;
  return Math.round((done / items.length) * 100);
}

/**
 * Where "Continue" should land: the next item's chapter, plus the
 * current step when that item already has an active guided session.
 * Returns null when the plan is complete, empty, or the next item's
 * ref is unparseable.
 */
export async function resumeTarget(planId: string): Promise<ResumeTarget | null> {
  const next = await getNextItem(planId);
  if (!next) return null;

  const ref = parseItemRef(next);
  if (!ref) return null;

  const target: ResumeTarget = { bookId: ref.bookId, chapterNum: ref.chapterNum };

  if (next.session_id != null) {
    const sessionId = Number(next.session_id);
    if (Number.isFinite(sessionId)) {
      const session = await getGuidedStudySession(sessionId);
      if (session && session.status === 'active') {
        target.step = session.current_step;
      }
    }
  }

  return target;
}
