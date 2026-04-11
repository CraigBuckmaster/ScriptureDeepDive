/**
 * Tests for db/database.ts — Content database initialization.
 */

const mockOpenDatabaseAsync = jest.fn();
const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetFirstAsync = jest.fn();
const mockCloseAsync = jest.fn().mockResolvedValue(undefined);
const mockGetInfoAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);
const mockCopyAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: any[]) => mockOpenDatabaseAsync(...args),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/mock/documents/',
  getInfoAsync: (...args: any[]) => mockGetInfoAsync(...args),
  makeDirectoryAsync: (...args: any[]) => mockMakeDirectoryAsync(...args),
  deleteAsync: (...args: any[]) => mockDeleteAsync(...args),
  copyAsync: (...args: any[]) => mockCopyAsync(...args),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///mock/asset/scripture.db',
    })),
  },
}));

jest.mock('../../assets/db-manifest.json', () => ({
  content_hash: 'abc123',
  build_time: '2025-01-01',
}), { virtual: true });

jest.mock('../../assets/scripture.db', () => 'mock-asset', { virtual: true });

jest.mock('@/db/translationRegistry', () => ({
  isBundled: jest.fn((id: string) => id === 'kjv' || id === 'asv'),
}));

jest.mock('@/db/translationManager', () => ({
  openTranslationDb: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Reset the module-level db singleton between tests
let databaseModule: any;

describe('database', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockOpenDatabaseAsync.mockResolvedValue({
      execAsync: mockExecAsync,
      getFirstAsync: mockGetFirstAsync,
      closeAsync: mockCloseAsync,
    });
    mockGetInfoAsync.mockResolvedValue({ exists: false });
  });

  describe('getDb', () => {
    it('throws if database not initialized', () => {
      databaseModule = require('@/db/database');
      expect(() => databaseModule.getDb()).toThrow('Database not initialized');
    });
  });

  describe('initDatabase', () => {
    it('opens database and returns it', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      const db = await databaseModule.initDatabase();
      expect(db).toBeDefined();
      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('scripture.db');
    });

    it('returns cached db on second call', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      const db1 = await databaseModule.initDatabase();
      const db2 = await databaseModule.initDatabase();
      expect(db1).toBe(db2);
      expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVerseDb', () => {
    it('returns core db for bundled translations', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      await databaseModule.initDatabase();
      const db = await databaseModule.getVerseDb('kjv');
      expect(db).toBeDefined();
    });

    it('opens translation db for non-bundled translations', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      await databaseModule.initDatabase();
      const { openTranslationDb } = require('@/db/translationManager');
      await databaseModule.getVerseDb('esv');
      expect(openTranslationDb).toHaveBeenCalledWith('esv');
    });
  });

  describe('initDatabase on native platform', () => {
    it('copies asset database when file does not exist', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));
      jest.resetModules();
      // DB file doesn't exist => needs copy
      mockGetInfoAsync
        .mockResolvedValueOnce({ exists: false }) // copyAssetDatabaseIfNeeded check
        .mockResolvedValueOnce({ exists: true, size: 5000000 }); // post-copy info check

      databaseModule = require('@/db/database');
      const db = await databaseModule.initDatabase();
      expect(db).toBeDefined();
      expect(mockMakeDirectoryAsync).toHaveBeenCalled();
      expect(mockCopyAsync).toHaveBeenCalled();
      expect(mockExecAsync).toHaveBeenCalledWith('PRAGMA journal_mode=WAL');
    });

    it('skips copy when installed hash matches expected', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
      }));
      jest.resetModules();
      // DB exists with correct hash
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000000 });
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'abc123' });

      databaseModule = require('@/db/database');
      const db = await databaseModule.initDatabase();
      expect(db).toBeDefined();
      // Should not copy since hash matches
      expect(mockCopyAsync).not.toHaveBeenCalled();
    });

    it('replaces DB when hash does not match', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));
      jest.resetModules();
      // DB exists but wrong hash
      mockGetInfoAsync
        .mockResolvedValueOnce({ exists: true, size: 5000000 }) // exists check
        .mockResolvedValueOnce({ exists: true, size: 5000000 }); // post-copy
      // getInstalledContentHash opens db, reads hash, closes
      mockGetFirstAsync.mockResolvedValueOnce({ value: 'old_hash' });

      databaseModule = require('@/db/database');
      const db = await databaseModule.initDatabase();
      expect(db).toBeDefined();
      // Should delete old and copy new
      expect(mockDeleteAsync).toHaveBeenCalled();
      expect(mockCopyAsync).toHaveBeenCalled();
    });
  });
});
