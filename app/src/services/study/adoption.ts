/**
 * services/study/adoption.ts — Start a study plan in one decision
 * (#1833). The picker never asks for a mode: plans adopt the last mode
 * the user chose in a session (`user_preferences` key
 * `guided_study_last_mode`), falling back to 'deep'.
 */
import { getPreference } from '../../db/userQueries';
import {
  completeStudyPlanItem,
  createStudyPlan,
  linkSessionToPlanItem,
} from '../../db/userMutations';
import { GUIDED_STUDY_MODES, type GuidedStudyMode } from '../guidedStudy/types';
import type { StudyPlanItemRef, StudyPlanType } from '../../types';
import { logger } from '../../utils/logger';
import { getNextItem } from './progression';
import {
  buildBookPlanItems,
  buildJourneyPlanItems,
  buildTopicPlanItems,
} from './planTemplates';

export const LAST_MODE_PREF_KEY = 'guided_study_last_mode';

/** Pure resolution of the picker's default mode — exported for tests. */
export function resolveDefaultMode(value: string | null | undefined): GuidedStudyMode {
  return (GUIDED_STUDY_MODES as readonly string[]).includes(value ?? '')
    ? (value as GuidedStudyMode)
    : 'deep';
}

/** The mode new plans adopt: last mode used in a session, else 'deep'. */
export async function getDefaultStudyMode(): Promise<GuidedStudyMode> {
  try {
    return resolveDefaultMode(await getPreference(LAST_MODE_PREF_KEY));
  } catch (err) {
    logger.warn('studyPlans', 'Failed to read last study mode preference', err);
    return 'deep';
  }
}

export interface StartStudyPlanArgs {
  planType: Exclude<StudyPlanType, 'custom'>;
  sourceId: string;
  title: string;
}

export interface StartedStudyPlan {
  planId: string;
  mode: GuidedStudyMode;
  /** Ref of item 1 — where the first session should open. */
  firstRef: StudyPlanItemRef;
}

/**
 * Create a plan from content-derived template items and hand back what
 * navigation needs. Returns null when the source resolves to zero
 * items (unknown id, journey with no scripture stops, topic without
 * relevant chapters) — callers should surface that instead of opening
 * an empty session.
 */
export async function startStudyPlan(args: StartStudyPlanArgs): Promise<StartedStudyPlan | null> {
  const items =
    args.planType === 'book'
      ? await buildBookPlanItems(args.sourceId)
      : args.planType === 'journey'
        ? await buildJourneyPlanItems(args.sourceId)
        : await buildTopicPlanItems(args.sourceId);

  if (items.length === 0) {
    logger.warn(
      'studyPlans',
      `startStudyPlan: "${args.sourceId}" (${args.planType}) resolved to zero items`,
    );
    return null;
  }

  const mode = await getDefaultStudyMode();
  const planId = await createStudyPlan({
    planType: args.planType,
    sourceId: args.sourceId,
    title: args.title,
    defaultMode: mode,
    items,
  });
  return { planId, mode, firstRef: items[0].ref };
}

/**
 * Session-completion wiring (#1833): when a guided session that
 * belongs to a plan is marked complete, link the session onto the
 * plan's first incomplete item for that chapter and complete it.
 * No-op when the chapter isn't (or is no longer) pending in the plan.
 */
export async function completePlanItemForSession(
  planId: string,
  bookId: string,
  chapterNum: number,
  sessionId: number,
): Promise<void> {
  const next = await getNextItem(planId);
  // Walk from the next item onward isn't needed: sessions launched from
  // a plan always target the next item's chapter. Guard anyway so an
  // out-of-order session (user wandered to another chapter) never
  // completes the wrong item.
  if (!next) return;
  try {
    const ref: StudyPlanItemRef = JSON.parse(next.ref_json);
    if (ref.bookId !== bookId || ref.chapterNum !== chapterNum) {
      logger.info(
        'studyPlans',
        `completePlanItemForSession: session chapter ${bookId}_${chapterNum} does not match next item — skipping`,
      );
      return;
    }
  } catch (err) {
    logger.warn('studyPlans', `completePlanItemForSession: bad ref_json on ${planId}`, err);
    return;
  }
  await linkSessionToPlanItem(planId, next.item_num, sessionId);
  await completeStudyPlanItem(planId, next.item_num);
}
