/**
 * #1831 — focused test for migration v25 (unified study plans:
 * study_plans, study_plan_items, plan_id on guided_study_sessions).
 *
 * Mirrors __tests__/db/migrationV24.test.ts so the migration-runner
 * mocks are reused. NOT mocking @/db/userDatabase — the point is to
 * exercise the real migration loop on a fresh install and on a v24 DB.
 */
const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockWithTransactionAsync = jest
  .fn()
  .mockImplementation(async (cb: () => Promise<void>) => cb());
const mockOpenDatabaseAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: unknown[]) => mockOpenDatabaseAsync(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  mockOpenDatabaseAsync.mockResolvedValue({
    execAsync: mockExecAsync,
    getAllAsync: mockGetAllAsync,
    runAsync: mockRunAsync,
    withTransactionAsync: mockWithTransactionAsync,
  });
});

describe('migration v25 — unified study plans', () => {
  it('the migration count includes v25', () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT } = require('@/db/userDatabase');
    expect(MIGRATION_COUNT).toBeGreaterThanOrEqual(25);
  });

  it('applies cleanly on a fresh install (no versions applied → every migration runs)', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce([]);
    await initUserDatabase();
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(MIGRATION_COUNT);
  });

  it('runs v25 (and any later migrations) on a v24 DB', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 24 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    // v25 plus whatever gets appended later — one transaction each.
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(MIGRATION_COUNT - 24);
  });

  it('skips every migration when v25 (and all earlier versions) are already applied', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: MIGRATION_COUNT }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });

  it("v25's SQL creates both plan tables and adds plan_id to guided_study_sessions", async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 24 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    const allSql = mockExecAsync.mock.calls
      .map((c) => (typeof c[0] === 'string' ? c[0] : ''))
      .join('\n');
    expect(allSql).toContain('CREATE TABLE IF NOT EXISTS study_plans');
    expect(allSql).toContain('CREATE TABLE IF NOT EXISTS study_plan_items');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN plan_id TEXT');
    // Append-only contract: v25 must not drop or rewrite legacy tables.
    expect(allSql).not.toMatch(/DROP TABLE/i);
    expect(allSql).not.toMatch(/ALTER TABLE reading_plans/i);
    expect(allSql).not.toMatch(/ALTER TABLE plan_progress/i);
  });
});
