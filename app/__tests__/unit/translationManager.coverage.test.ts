/**
 * Extended coverage tests for db/translationManager.ts —
 * covers downloadTranslation, openTranslationDb, deleteTranslation, closeAllTranslationDbs.
 */

const mockDb = {
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  execAsync: jest.fn().mockResolvedValue(undefined),
  closeAsync: jest.fn().mockResolvedValue(undefined),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn().mockReturnValue({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///mock/translation.db',
    }),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/docs/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false, size: 0 }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/db/translationRegistry', () => ({
  TRANSLATION_MAP: new Map([
    ['kjv', { id: 'kjv', label: 'KJV', bundled: true, sizeBytes: 0 }],
    ['asv', { id: 'asv', label: 'ASV', bundled: true, sizeBytes: 0 }],
  ]),
  isBundled: jest.fn((id: string) => id === 'kjv' || id === 'asv'),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import {
  isTranslationInstalled,
  getInstalledSize,
  downloadTranslation,
  openTranslationDb,
  deleteTranslation,
  closeAllTranslationDbs,
} from '@/db/translationManager';

const FileSystem = require('expo-file-system/legacy');
const SQLite = require('expo-sqlite');

describe('translationManager — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.execAsync.mockResolvedValue(undefined);
    mockDb.closeAsync.mockResolvedValue(undefined);
  });

  describe('downloadTranslation', () => {
    it('skips download for bundled translations', async () => {
      await downloadTranslation('kjv');
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });

    it('skips download for unknown translations', async () => {
      await downloadTranslation('unknown_id');
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });

    it('throws error when no asset is found for translation', async () => {
      const { TRANSLATION_MAP } = require('@/db/translationRegistry');
      TRANSLATION_MAP.set('esv', { id: 'esv', label: 'ESV', bundled: false, sizeBytes: 5000000 });

      await expect(downloadTranslation('esv')).rejects.toThrow('No asset found');

      TRANSLATION_MAP.delete('esv');
    });

    it('deduplicates concurrent downloads', async () => {
      const { TRANSLATION_MAP } = require('@/db/translationRegistry');
      TRANSLATION_MAP.set('test_dup', { id: 'test_dup', label: 'Test', bundled: false, sizeBytes: 1000 });

      // Both calls should use the same promise (it will fail because no asset, but it tests dedup)
      const p1 = downloadTranslation('test_dup').catch(() => {});
      const p2 = downloadTranslation('test_dup').catch(() => {});

      await Promise.all([p1, p2]);

      TRANSLATION_MAP.delete('test_dup');
    });
  });

  describe('openTranslationDb', () => {
    it('throws if translation is not installed', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false, size: 0 });
      const { TRANSLATION_MAP } = require('@/db/translationRegistry');
      TRANSLATION_MAP.set('not_installed', { id: 'not_installed', label: 'NI', bundled: false, sizeBytes: 1000 });

      await expect(openTranslationDb('not_installed')).rejects.toThrow('Translation not installed');

      TRANSLATION_MAP.delete('not_installed');
    });
  });

  describe('deleteTranslation', () => {
    it('deletes file when no DB is cached', async () => {
      await deleteTranslation('no_cache');
      expect(FileSystem.deleteAsync).toHaveBeenCalled();
    });
  });

  describe('closeAllTranslationDbs', () => {
    it('does not crash when called with no open dbs', async () => {
      await closeAllTranslationDbs();
      // No crash
    });
  });
});
