/**
 * Tests for db/userDatabase.ts — User database initialization and migrations.
 */

const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockWithTransactionAsync = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb());
const mockOpenDatabaseAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: any[]) => mockOpenDatabaseAsync(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

let userDatabaseModule: any;

describe('userDatabase', () => {
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

  describe('getUserDb', () => {
    it('throws if not initialized', () => {
      userDatabaseModule = require('@/db/userDatabase');
      expect(() => userDatabaseModule.getUserDb()).toThrow('User database not initialized');
    });
  });

  describe('initUserDatabase', () => {
    it('opens user.db and runs migrations', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      userDatabaseModule = require('@/db/userDatabase');
      const db = await userDatabaseModule.initUserDatabase();
      expect(db).toBeDefined();
      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('user.db');
      // WAL mode enabled on native
      expect(mockExecAsync).toHaveBeenCalledWith('PRAGMA journal_mode=WAL');
      // Migration tracking table created
      expect(mockExecAsync).toHaveBeenCalledWith(expect.stringContaining('_migrations'));
    });

    it('returns cached db on second call', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      userDatabaseModule = require('@/db/userDatabase');
      const db1 = await userDatabaseModule.initUserDatabase();
      const db2 = await userDatabaseModule.initUserDatabase();
      expect(db1).toBe(db2);
      expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });

    it('skips WAL on web', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'web' } }));
      jest.resetModules();
      userDatabaseModule = require('@/db/userDatabase');
      await userDatabaseModule.initUserDatabase();
      // PRAGMA WAL should not be called
      const walCalls = mockExecAsync.mock.calls.filter(
        (c: any[]) => typeof c[0] === 'string' && c[0].includes('journal_mode=WAL'),
      );
      expect(walCalls).toHaveLength(0);
    });

    it('skips already applied migrations', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      // Simulate all migrations already applied
      mockGetAllAsync.mockResolvedValueOnce(
        Array.from({ length: 14 }, (_, i) => ({ version: i + 1 })),
      );
      userDatabaseModule = require('@/db/userDatabase');
      await userDatabaseModule.initUserDatabase();
      // withTransactionAsync should NOT have been called since all migrations are applied
      expect(mockWithTransactionAsync).not.toHaveBeenCalled();
    });

    it('runs pending migrations in order', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      // Simulate only version 1 applied
      mockGetAllAsync.mockResolvedValueOnce([{ version: 1 }]);
      userDatabaseModule = require('@/db/userDatabase');
      await userDatabaseModule.initUserDatabase();
      // Should run 13 remaining migrations (2 through 14)
      expect(mockWithTransactionAsync).toHaveBeenCalledTimes(13);
    });

    it('throws on migration failure', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      mockGetAllAsync.mockResolvedValueOnce([]);
      mockWithTransactionAsync.mockRejectedValueOnce(new Error('SQL error'));
      userDatabaseModule = require('@/db/userDatabase');
      await expect(userDatabaseModule.initUserDatabase()).rejects.toThrow('SQL error');
    });

    it('getUserDb works after initialization', async () => {
      jest.doMock('react-native', () => ({ Platform: { OS: 'ios' } }));
      jest.resetModules();
      userDatabaseModule = require('@/db/userDatabase');
      await userDatabaseModule.initUserDatabase();
      const db = userDatabaseModule.getUserDb();
      expect(db).toBeDefined();
      expect(db.execAsync).toBeDefined();
    });
  });
});
