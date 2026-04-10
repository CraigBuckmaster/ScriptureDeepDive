/**
 * Tests for db/database.ts — initDatabase and getDb.
 */
jest.unmock('expo-sqlite');

const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockCloseAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });

const mockDbInstance = {
  execAsync: mockExecAsync,
  getFirstAsync: mockGetFirstAsync,
  closeAsync: mockCloseAsync,
  getAllAsync: mockGetAllAsync,
  runAsync: mockRunAsync,
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDbInstance),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: '/fake/asset/scripture.db',
    }),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/fake/docs/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/translationRegistry', () => ({
  isBundled: jest.fn().mockReturnValue(true),
}));

jest.mock('@/db/translationManager', () => ({
  openTranslationDb: jest.fn().mockResolvedValue(mockDbInstance),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('database', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('initDatabase returns a database instance', async () => {
    const { initDatabase } = require('@/db/database');
    const db = await initDatabase();
    expect(db).toBe(mockDbInstance);
  });

  it('getDb throws if not initialized', () => {
    const { getDb } = require('@/db/database');
    expect(() => getDb()).toThrow('Database not initialized');
  });

  it('getDb returns db after initialization', async () => {
    const { initDatabase, getDb } = require('@/db/database');
    await initDatabase();
    const db = getDb();
    expect(db).toBe(mockDbInstance);
  });

  it('initDatabase returns cached db on second call', async () => {
    const { initDatabase } = require('@/db/database');
    const db1 = await initDatabase();
    const db2 = await initDatabase();
    expect(db1).toBe(db2);
  });

  it('getVerseDb returns core db for bundled translations', async () => {
    const { initDatabase, getVerseDb } = require('@/db/database');
    await initDatabase();
    const verseDb = await getVerseDb('kjv');
    expect(verseDb).toBe(mockDbInstance);
  });

  it('getVerseDb calls openTranslationDb for non-bundled translations', async () => {
    const { isBundled } = require('@/db/translationRegistry');
    isBundled.mockReturnValue(false);

    const { initDatabase, getVerseDb } = require('@/db/database');
    await initDatabase();
    await getVerseDb('esv');

    const { openTranslationDb } = require('@/db/translationManager');
    expect(openTranslationDb).toHaveBeenCalledWith('esv');
  });
});
