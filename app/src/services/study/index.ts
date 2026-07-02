/**
 * services/study — Unified study-plan service layer (#1831).
 *
 * Data model lives in user.db (migration v25: `study_plans`,
 * `study_plan_items`); CRUD lives in db/userQueries + db/userMutations.
 * This barrel exposes the derived helpers: template builders,
 * progression, weekly rhythm, and the one-time legacy seed.
 */
export {
  buildBookPlanItems,
  buildJourneyPlanItems,
  buildTopicPlanItems,
  parseChapterId,
} from './planTemplates';
export {
  getActivePlan,
  getNextItem,
  percentComplete,
  resumeTarget,
  type ResumeTarget,
} from './progression';
export {
  getWeeklyRhythm,
  isoWeekKey,
  isoWeekStart,
  parseSqliteUtc,
  type WeeklyRhythm,
} from './rhythm';
export { migrateLegacyPlans } from './migrateLegacyPlans';
export {
  completePlanItemForSession,
  getDefaultStudyMode,
  LAST_MODE_PREF_KEY,
  resolveDefaultMode,
  startStudyPlan,
  type StartedStudyPlan,
  type StartStudyPlanArgs,
} from './adoption';
