/**
 * #1835 — migration v26 (visited_trail_json + deferred_trail_json on
 * guided_study_sessions). Mirrors migrationV25.test.ts.
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

describe('migration v26 — evidence trail columns', () => {
  it('the migration count includes v26', () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT } = require('@/db/userDatabase');
    expect(MIGRATION_COUNT).toBeGreaterThanOrEqual(26);
  });

  it('runs v26 (and any later migrations) on a v25 DB', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 25 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    expect(mockWithTransactionAsync).toHaveBeenCalledTimes(MIGRATION_COUNT - 25);
  });

  it('skips everything when v26 is already applied', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { MIGRATION_COUNT, initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: MIGRATION_COUNT }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });

  it("v26's SQL adds both trail columns and nothing else is dropped/rewritten", async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    jest.resetModules();
    const { initUserDatabase } = require('@/db/userDatabase');
    mockGetAllAsync.mockResolvedValueOnce(
      Array.from({ length: 25 }, (_, i) => ({ version: i + 1 })),
    );
    await initUserDatabase();
    const allSql = mockExecAsync.mock.calls
      .map((c) => (typeof c[0] === 'string' ? c[0] : ''))
      .join('\n');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN visited_trail_json TEXT');
    expect(allSql).toContain('ALTER TABLE guided_study_sessions ADD COLUMN deferred_trail_json TEXT');
    expect(allSql).not.toMatch(/DROP TABLE/i);
  });
});
