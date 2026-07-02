/**
 * Phase 2.8 (#1737) — focused idempotency test for migration v24
 * (Phase 2.2, captured_inputs_json + mode_artifact_json + synthesis_
 * strategy on guided_study_sessions).
 *
 * Mirrors the structural pattern of __tests__/db/userDatabase.test.ts so
 * the existing migration runner mocks are reused. NOT mocking
 * @/db/userDatabase here because we want to exercise the real migration
 * loop — that's the whole point of the idempotency check.
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

describe('migration v24 — captured_inputs columns on guided_study_sessions', () => {
  it('the migration count includes v24 (proves the migration was added)', () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT } = require('@/db/userDatabase');
    expect(MIGRATION_COUNT).toBeGreaterThanOrEqual(24);
  });

  it('skips every migration when v24 (and all earlier versions) are already applied', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: MIGRATION_COUNT }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });

  it('runs v24 (and any later migrations) when only versions 1..23 have run', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 23 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    // v24 plus whatever has been appended since — one transaction each.
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(MIGRATION_COUNT - 23);
  });

  it("v24's SQL adds the three captured-inputs columns to guided_study_sessions", async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 23 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    // execAsync receives every migration's SQL plus the WAL/_migrations
    // prep statements. Find the call that ALTERs guided_study_sessions.
    const allSql = mockExecAsync.mock.calls
      .map((c) => (typeof c[0] === 'string' ? c[0] : ''))
      .join('\n');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN captured_inputs_json');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN mode_artifact_json');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN synthesis_strategy');
  });
});
