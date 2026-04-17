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
const fileState: { exists: boolean; size: number } = { exists: true, size: 5_000_000 };
jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    constructor(...parts: any[]) {
      this.uri = parts.map((p) => (p?.uri ?? String(p))).join('/');
    }
    get exists(): boolean { return fileState.exists; }
    get size(): number { return fileState.size; }
    create() { /* no-op */ }
    delete() { /* no-op */ }
    copy() { /* no-op */ }
    move() { /* no-op */ }
    write() { /* no-op */ }
    async text() { return ''; }
    async base64() { return ''; }
    async bytes() { return new Uint8Array(); }
    static async downloadFileAsync(_url: string, destination: any) { return destination; }
  }
  class MockDirectory {
    uri: string;
    constructor(...parts: any[]) {
      this.uri = parts.map((p) => (p?.uri ?? String(p))).join('/');
    }
    exists = true;
    create() { /* no-op */ }
    delete() { /* no-op */ }
  }
  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { document: '/fake/docs', cache: '/fake/cache' },
  };
});

jest.mock('@/db/translationRegistry', () => ({
  isBundled: jest.fn().mockReturnValue(true),
}));

jest.mock('@/db/translationManager', () => ({
  openTranslationDb: jest.fn().mockResolvedValue(mockDbInstance),
}));

beforeEach(() => {
  jest.clearAllMocks();
  fileState.exists = true;
  fileState.size = 5_000_000;
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
    fileState.exists = false;
    fileState.size = 0;
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
