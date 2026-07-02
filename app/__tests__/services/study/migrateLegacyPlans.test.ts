/**
 * #1831 — legacy reading-plan seed (services/study/migrateLegacyPlans).
 *
 * Uses a targeted in-memory fake of the user.db surface the seed
 * touches (app_meta guard, reading_plans/plan_progress reads,
 * INSERT OR IGNORE writes) so idempotency is exercised for real:
 * both the app_meta short-circuit and the deterministic-id/OR-IGNORE
 * layer that protects a retry after a mid-flight failure.
 */
import type { PlanProgress, ReadingPlan } from '@/db/userQueries';

interface FakeDb {
  appMeta: Map<string, string>;
  studyPlans: Map<string, unknown[]>;
  planItems: Map<string, unknown[]>;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
}

const LEGACY_PLANS: ReadingPlan[] = [
  {
    id: 'psalms_of_lament',
    name: 'Psalms of Lament',
    description: 'Seven lament psalms.',
    total_days: 2,
    chapters_json: JSON.stringify([
      { day: 1, chapters: ['psalms_13'] },
      { day: 2, chapters: ['psalms_22', 'psalms_42'] },
    ]),
  },
  {
    id: 'life_of_david',
    name: 'The Life of David',
    description: 'David from shepherd to king.',
    total_days: 1,
    chapters_json: JSON.stringify([{ day: 1, chapters: ['1_samuel_16', '1_samuel_17'] }]),
  },
  {
    // Curated seed the user never started (no plan_progress rows) —
    // must NOT migrate, or every fresh install "has plans" (#1837).
    id: 'untouched_seed',
    name: 'Untouched Seed',
    description: 'Shipped with the app, never started.',
    total_days: 1,
    chapters_json: JSON.stringify([{ day: 1, chapters: ['genesis_1'] }]),
  },
];

const LEGACY_PROGRESS: PlanProgress[] = [
  { plan_id: 'psalms_of_lament', day_num: 1, completed_at: '2026-06-01 09:00:00' },
  { plan_id: 'psalms_of_lament', day_num: 2, completed_at: null },
  { plan_id: 'life_of_david', day_num: 1, completed_at: '2026-06-15 20:30:00' },
];

function makeFakeDb(plans: ReadingPlan[], progress: PlanProgress[]): FakeDb {
  const appMeta = new Map<string, string>();
  const studyPlans = new Map<string, unknown[]>();
  const planItems = new Map<string, unknown[]>();

  const db: FakeDb = {
    appMeta,
    studyPlans,
    planItems,
    getFirstAsync: jest.fn(async (sql: string, params: unknown[]) => {
      if (sql.includes('FROM app_meta')) {
        const value = appMeta.get(params[0] as string);
        return value != null ? { value } : null;
      }
      return null;
    }),
    getAllAsync: jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('FROM reading_plans')) return plans;
      if (sql.includes('FROM plan_progress')) {
        return progress.filter((p) => p.plan_id === (params?.[0] as string));
      }
      return [];
    }),
    runAsync: jest.fn(async (sql: string, params: unknown[]) => {
      if (sql.includes('INTO study_plans')) {
        // INSERT OR IGNORE on PRIMARY KEY (id)
        const id = params[0] as string;
        if (!studyPlans.has(id)) studyPlans.set(id, params);
      } else if (sql.includes('INTO study_plan_items')) {
        // INSERT OR IGNORE on PRIMARY KEY (plan_id, item_num)
        const key = `${params[0]}:${params[1]}`;
        if (!planItems.has(key)) planItems.set(key, params);
      } else if (sql.includes('INTO app_meta')) {
        appMeta.set(params[0] as string, '1');
      }
      return { changes: 1 };
    }),
    withTransactionAsync: jest.fn(async (cb: () => Promise<void>) => cb()),
  };
  return db;
}

let mockDb: FakeDb;

jest.mock('@/db/userDatabase', () => ({
  getUserDb: () => mockDb,
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { migrateLegacyPlans } from '@/services/study';

beforeEach(() => {
  jest.clearAllMocks();
  mockDb = makeFakeDb(LEGACY_PLANS, LEGACY_PROGRESS);
});

describe('migrateLegacyPlans (#1831)', () => {
  it('seeds one custom study plan per STARTED legacy reading plan', async () => {
    await migrateLegacyPlans();

    expect(mockDb.studyPlans.size).toBe(2);
    const psalms = mockDb.studyPlans.get('legacy_psalms_of_lament');
    // params: [id, source_id, title] — plan_type/default_mode are inline SQL
    expect(psalms).toEqual(['legacy_psalms_of_lament', 'psalms_of_lament', 'Psalms of Lament']);
    const insertPlanSql = mockDb.runAsync.mock.calls.find((c) =>
      (c[0] as string).includes('INTO study_plans'),
    )?.[0] as string;
    expect(insertPlanSql).toContain("'custom'");
    expect(insertPlanSql).toContain("'quick'");
  });

  it('skips curated seeds the user never started (no plan_progress rows)', async () => {
    await migrateLegacyPlans();
    expect(mockDb.studyPlans.has('legacy_untouched_seed')).toBe(false);
    expect(mockDb.planItems.has('legacy_untouched_seed:1')).toBe(false);
    // Guard still set — the seed is done even when plans are skipped.
    expect(mockDb.appMeta.get('legacy_plans_migrated')).toBe('1');
  });

  it('expands chapters_json into reading items and copies day completion onto them', async () => {
    await migrateLegacyPlans();

    // psalms_of_lament: day 1 = 1 chapter, day 2 = 2 chapters → items 1..3
    expect(mockDb.planItems.get('legacy_psalms_of_lament:1')).toEqual([
      'legacy_psalms_of_lament',
      1,
      JSON.stringify({ bookId: 'psalms', chapterNum: 13 }),
      '2026-06-01 09:00:00', // day 1 completed
    ]);
    expect(mockDb.planItems.get('legacy_psalms_of_lament:2')).toEqual([
      'legacy_psalms_of_lament',
      2,
      JSON.stringify({ bookId: 'psalms', chapterNum: 22 }),
      null, // day 2 not completed
    ]);
    expect(mockDb.planItems.get('legacy_psalms_of_lament:3')?.[3]).toBeNull();

    // Multi-underscore book ids parse correctly and inherit day completion.
    expect(mockDb.planItems.get('legacy_life_of_david:1')).toEqual([
      'legacy_life_of_david',
      1,
      JSON.stringify({ bookId: '1_samuel', chapterNum: 16 }),
      '2026-06-15 20:30:00',
    ]);
    expect(mockDb.planItems.get('legacy_life_of_david:2')?.[3]).toBe('2026-06-15 20:30:00');
    expect(mockDb.planItems.size).toBe(5);
  });

  it('sets the app_meta guard so the second run is a no-op', async () => {
    await migrateLegacyPlans();
    expect(mockDb.appMeta.get('legacy_plans_migrated')).toBe('1');

    const writesAfterFirstRun = mockDb.runAsync.mock.calls.length;
    await migrateLegacyPlans();

    expect(mockDb.runAsync.mock.calls.length).toBe(writesAfterFirstRun);
    expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(mockDb.studyPlans.size).toBe(2);
    expect(mockDb.planItems.size).toBe(5);
  });

  it('is idempotent on retry even when the guard was never written (OR IGNORE layer)', async () => {
    await migrateLegacyPlans();
    // Simulate a run where everything inserted but the guard write was lost.
    mockDb.appMeta.delete('legacy_plans_migrated');

    await migrateLegacyPlans();

    expect(mockDb.studyPlans.size).toBe(2);
    expect(mockDb.planItems.size).toBe(5);
    expect(mockDb.appMeta.get('legacy_plans_migrated')).toBe('1');
  });

  it('skips unparseable chapter ids without aborting the seed', async () => {
    mockDb = makeFakeDb(
      [
        {
          id: 'broken',
          name: 'Broken',
          description: '',
          total_days: 1,
          chapters_json: JSON.stringify([{ day: 1, chapters: ['???', 'genesis_1'] }]),
        },
      ],
      // Started (has a progress row) so the plan qualifies for migration.
      [{ plan_id: 'broken', day_num: 1, completed_at: null }],
    );

    await migrateLegacyPlans();

    expect(mockDb.studyPlans.size).toBe(1);
    // item_num 1 was consumed by the skipped id; genesis_1 lands at 2.
    expect(mockDb.planItems.size).toBe(1);
    expect(mockDb.planItems.get('legacy_broken:2')?.[2]).toBe(
      JSON.stringify({ bookId: 'genesis', chapterNum: 1 }),
    );
    expect(mockDb.appMeta.get('legacy_plans_migrated')).toBe('1');
  });
});
