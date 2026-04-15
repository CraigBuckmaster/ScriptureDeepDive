/**
 * Tests for db/database.ts — Content database initialization.
 *
 * Since scripture.db is now delivered via R2 (not bundled), initDatabase()
 * returns 'needs_download' when the DB file is missing or too small, and
 * 'ready' once the DB is open.
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

  describe('initDatabase on web', () => {
    it('opens database and returns ready', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      const status = await databaseModule.initDatabase();
      expect(status).toBe('ready');
      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('scripture.db');
    });

    it('returns ready on cached second call', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'web' },
      }));
      jest.resetModules();
      databaseModule = require('@/db/database');
      const s1 = await databaseModule.initDatabase();
      const s2 = await databaseModule.initDatabase();
      expect(s1).toBe('ready');
      expect(s2).toBe('ready');
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
    it('returns needs_download when DB file does not exist', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));
      jest.resetModules();
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });

      databaseModule = require('@/db/database');
      const status = await databaseModule.initDatabase();
      expect(status).toBe('needs_download');
      // Should NOT open the DB until it has been downloaded
      expect(mockOpenDatabaseAsync).not.toHaveBeenCalled();
    });

    it('returns needs_download when DB file is too small', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'ios' },
      }));
      jest.resetModules();
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, size: 100 });

      databaseModule = require('@/db/database');
      const status = await databaseModule.initDatabase();
      expect(status).toBe('needs_download');
      expect(mockOpenDatabaseAsync).not.toHaveBeenCalled();
    });

    it('returns ready and enables WAL when DB is present', async () => {
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
      }));
      jest.resetModules();
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, size: 5_000_000 });

      databaseModule = require('@/db/database');
      const status = await databaseModule.initDatabase();
      expect(status).toBe('ready');
      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('scripture.db');
      expect(mockExecAsync).toHaveBeenCalledWith('PRAGMA journal_mode=WAL');
    });
  });
});
