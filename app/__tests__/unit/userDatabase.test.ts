/**
 * Tests for db/userDatabase.ts — initUserDatabase and getUserDb.
 */

jest.unmock('expo-sqlite');

const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockWithTransactionAsync = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb());

const mockUserDbInstance = {
  execAsync: mockExecAsync,
  getAllAsync: mockGetAllAsync,
  runAsync: mockRunAsync,
  withTransactionAsync: mockWithTransactionAsync,
  getFirstAsync: jest.fn().mockResolvedValue(null),
  closeAsync: jest.fn().mockResolvedValue(undefined),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockUserDbInstance),
}));

describe('userDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockGetAllAsync.mockResolvedValue([]);
  });

  it('initUserDatabase returns a database instance', async () => {
    const { initUserDatabase } = require('@/db/userDatabase');
    const db = await initUserDatabase();
    expect(db).toBe(mockUserDbInstance);
  });

  it('getUserDb throws if not initialized', () => {
    const { getUserDb } = require('@/db/userDatabase');
    expect(() => getUserDb()).toThrow('User database not initialized');
  });

  it('getUserDb returns db after initialization', async () => {
    const { initUserDatabase, getUserDb } = require('@/db/userDatabase');
    await initUserDatabase();
    const db = getUserDb();
    expect(db).toBe(mockUserDbInstance);
  });

  it('initUserDatabase returns cached db on second call', async () => {
    const { initUserDatabase } = require('@/db/userDatabase');
    const db1 = await initUserDatabase();
    const db2 = await initUserDatabase();
    expect(db1).toBe(db2);
  });

  it('runs migrations on first initialization', async () => {
    const { initUserDatabase } = require('@/db/userDatabase');
    await initUserDatabase();

    // Should have created _migrations table
    expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS _migrations'));

    // Should have queried for applied migrations
    expect(mockGetAllAsync).toHaveBeenCalledWith(expect.stringContaining('SELECT version FROM _migrations'));
  });

  it('skips already-applied migrations', async () => {
    // Simulate all 16 migrations already applied
    mockGetAllAsync.mockResolvedValue(
      Array.from({ length: 16 }, (_, i) => ({ version: i + 1 })),
    );

    const { initUserDatabase } = require('@/db/userDatabase');
    await initUserDatabase();

    // withTransactionAsync should NOT be called since all migrations are applied
    expect(mockWithTransactionAsync).not.toHaveBeenCalled();
  });
});
