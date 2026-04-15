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

// Simulate a DB file present on-device so initDatabase() returns 'ready'.
const mockGetInfoAsync = jest.fn().mockResolvedValue({ exists: true, size: 5_000_000 });
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/fake/docs/',
  getInfoAsync: (...args: any[]) => mockGetInfoAsync(...args),
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
  mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5_000_000 });
});

describe('database', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('initDatabase returns ready when DB is present', async () => {
    const { initDatabase } = require('@/db/database');
    const status = await initDatabase();
    expect(status).toBe('ready');
  });

  it('initDatabase returns needs_download when DB is missing', async () => {
    mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
    const { initDatabase } = require('@/db/database');
    const status = await initDatabase();
    expect(status).toBe('needs_download');
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

  it('initDatabase returns ready on cached second call', async () => {
    const { initDatabase } = require('@/db/database');
    const s1 = await initDatabase();
    const s2 = await initDatabase();
    expect(s1).toBe('ready');
    expect(s2).toBe('ready');
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
