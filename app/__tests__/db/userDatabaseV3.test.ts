const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockWithTransactionAsync = jest
  .fn()
  .mockImplementation(async (cb: () => Promise<void>) => cb());
const mockOpenDatabaseAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: any[]) => mockOpenDatabaseAsync(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('userDatabase V3 migration', () => {
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

  it('adds guided study questions migration SQL', async () => {
    jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
    const userDatabase = require('@/db/userDatabase');

    await userDatabase.initUserDatabase();

    const migrationSql = mockExecAsync.mock.calls
      .map(([sql]: [string]) => sql)
      .find((sql) => sql.includes('CREATE TABLE IF NOT EXISTS guided_study_questions'));

    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS guided_study_questions');
    expect(migrationSql).toContain('INSERT OR IGNORE INTO guided_study_questions');
  });
});
