/**
 * services/study/migrateLegacyPlans.ts — One-time seed of legacy
 * reading plans into the unified study-plan tables (#1831).
 *
 * Runs once at startup after migrations, guarded by the `app_meta`
 * key `legacy_plans_migrated = '1'`. Every `reading_plans` row becomes
 * a `study_plans` row (plan_type 'custom', source_id = legacy id,
 * default_mode 'quick'); its `chapters_json` days become
 * `study_plan_items` rows (kind 'reading', one per chapter); and
 * `plan_progress.completed_at` is copied onto the matching items.
 *
 * The legacy tables are never dropped or altered — they stay readable
 * until #1838 retires the write paths. Idempotency comes from three
 * layers: the app_meta guard, deterministic plan ids
 * (`legacy_<reading_plan id>`), and INSERT OR IGNORE on every row.
 */
import { getUserDb } from '../../db/userDatabase';
import type { PlanProgress, ReadingPlan } from '../../db/userQueries';
import { logger } from '../../utils/logger';
import { parseChapterId } from './planTemplates';

const GUARD_KEY = 'legacy_plans_migrated';

interface LegacyPlanDay {
  day: number;
  chapters: string[];
}

function parseChaptersJson(chaptersJson: string, planId: string): LegacyPlanDay[] {
  try {
    const parsed: unknown = JSON.parse(chaptersJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is LegacyPlanDay =>
        typeof d === 'object' &&
        d !== null &&
        typeof (d as LegacyPlanDay).day === 'number' &&
        Array.isArray((d as LegacyPlanDay).chapters),
    );
  } catch (err) {
    logger.warn('studyPlans', `migrateLegacyPlans: bad chapters_json on "${planId}"`, err);
    return [];
  }
}

/**
 * Seed `study_plans` / `study_plan_items` from the legacy reading-plan
 * tables. Safe to call on every launch — after the first successful
 * run the app_meta guard makes it a no-op. Runs in one transaction, so
 * a mid-flight failure leaves the guard unset and the seed retries on
 * the next launch (deterministic ids + INSERT OR IGNORE make the retry
 * safe).
 */
export async function migrateLegacyPlans(): Promise<void> {
  const db = getUserDb();

  const guard = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [GUARD_KEY],
  );
  if (guard?.value === '1') return;

  const legacyPlans = await db.getAllAsync<ReadingPlan>('SELECT * FROM reading_plans');

  await db.withTransactionAsync(async () => {
    for (const legacy of legacyPlans) {
      const planId = `legacy_${legacy.id}`;
      await db.runAsync(
        `INSERT OR IGNORE INTO study_plans
           (id, plan_type, source_id, title, default_mode, created_at)
         VALUES (?, 'custom', ?, ?, 'quick', datetime('now'))`,
        [planId, legacy.id, legacy.name],
      );

      const progress = await db.getAllAsync<PlanProgress>(
        'SELECT * FROM plan_progress WHERE plan_id = ?',
        [legacy.id],
      );
      const completedByDay = new Map<number, string>();
      for (const p of progress) {
        if (p.completed_at) completedByDay.set(p.day_num, p.completed_at);
      }

      let itemNum = 0;
      for (const day of parseChaptersJson(legacy.chapters_json, legacy.id)) {
        for (const chapterId of day.chapters) {
          itemNum++;
          const ref = parseChapterId(chapterId);
          if (!ref) {
            logger.warn(
              'studyPlans',
              `migrateLegacyPlans: unparseable chapter "${chapterId}" in "${legacy.id}"`,
            );
            continue;
          }
          await db.runAsync(
            `INSERT OR IGNORE INTO study_plan_items
               (plan_id, item_num, kind, ref_json, completed_at)
             VALUES (?, ?, 'reading', ?, ?)`,
            [planId, itemNum, JSON.stringify(ref), completedByDay.get(day.day) ?? null],
          );
        }
      }
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO app_meta (key, value, updated_at)
       VALUES (?, '1', datetime('now'))`,
      [GUARD_KEY],
    );
  });

  logger.info('studyPlans', `migrateLegacyPlans: seeded ${legacyPlans.length} legacy plan(s)`);
}
