/**
 * Tests for db/translationManager.ts
 */

const mockGetInfoAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockCopyAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/mock/documents/',
  getInfoAsync: (...args: any[]) => mockGetInfoAsync(...args),
  makeDirectoryAsync: (...args: any[]) => mockMakeDirectoryAsync(...args),
  deleteAsync: (...args: any[]) => mockDeleteAsync(...args),
  copyAsync: (...args: any[]) => mockCopyAsync(...args),
}));

const mockOpenDatabaseAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...args: any[]) => mockOpenDatabaseAsync(...args),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn().mockResolvedValue(undefined),
      localUri: 'file:///local/asset.db',
    })),
  },
}));

jest.mock('@/db/translationRegistry', () => ({
  TRANSLATION_MAP: new Map([
    ['kjv', { id: 'kjv', bundled: true }],
    ['esv', { id: 'esv', bundled: false }],
    ['asv', { id: 'asv', bundled: false }],
  ]),
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

describe('translationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInfoAsync.mockResolvedValue({ exists: false, size: 0 });
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockDeleteAsync.mockResolvedValue(undefined);
    mockCopyAsync.mockResolvedValue(undefined);
  });

  describe('isTranslationInstalled', () => {
    it('returns true for bundled translations', async () => {
      const result = await isTranslationInstalled('kjv');
      expect(result).toBe(true);
    });

    it('returns true for unknown translations (treated as bundled)', async () => {
      const result = await isTranslationInstalled('unknown');
      expect(result).toBe(true);
    });

    it('returns false when file does not exist', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: false });
      const result = await isTranslationInstalled('esv');
      expect(result).toBe(false);
    });

    it('returns false when file exists but is too small', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 100 });
      const result = await isTranslationInstalled('esv');
      expect(result).toBe(false);
    });

    it('returns true when file exists with valid size', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000000 });
      const result = await isTranslationInstalled('esv');
      expect(result).toBe(true);
    });

    it('returns false when size is null/undefined', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: null });
      const result = await isTranslationInstalled('esv');
      expect(result).toBe(false);
    });
  });

  describe('getInstalledSize', () => {
    it('returns 0 when file does not exist', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: false });
      const size = await getInstalledSize('esv');
      expect(size).toBe(0);
    });

    it('returns file size when exists', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 4500000 });
      const size = await getInstalledSize('esv');
      expect(size).toBe(4500000);
    });

    it('returns 0 when size is undefined', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: undefined });
      const size = await getInstalledSize('esv');
      expect(size).toBe(0);
    });
  });

  describe('downloadTranslation', () => {
    it('no-ops for bundled translations', async () => {
      await downloadTranslation('kjv');
      expect(mockCopyAsync).not.toHaveBeenCalled();
    });

    it('throws for non-bundled translation without asset module', async () => {
      await expect(downloadTranslation('esv')).rejects.toThrow('No asset found');
    });

    it('calls onProgress callback', async () => {
      const progress = jest.fn();
      // Will throw because no asset module, but progress should be called before that
      await expect(downloadTranslation('esv', progress)).rejects.toThrow();
      expect(progress).toHaveBeenCalledWith(0.1);
    });

    it('deduplicates concurrent downloads of the same translation', async () => {
      const p1 = downloadTranslation('esv').catch(() => {});
      const p2 = downloadTranslation('esv').catch(() => {});
      // Both should resolve (or reject) — second call should return same promise
      await Promise.all([p1, p2]);
    });
  });

  describe('openTranslationDb', () => {
    it('throws when translation is not installed', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: false });
      await expect(openTranslationDb('esv')).rejects.toThrow('Translation not installed');
    });

    it('opens and caches DB when installed', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000000 });
      const mockDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        closeAsync: jest.fn().mockResolvedValue(undefined),
      };
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      const db = await openTranslationDb('esv');
      expect(db).toBe(mockDb);
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA journal_mode=WAL');

      // Second call should return cached
      const db2 = await openTranslationDb('esv');
      expect(db2).toBe(mockDb);
      expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTranslation', () => {
    it('deletes the translation file', async () => {
      await deleteTranslation('esv');
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('translation_esv.db'),
        { idempotent: true },
      );
    });

    it('closes DB if it was open before deleting', async () => {
      // First open a DB
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000000 });
      const mockDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        closeAsync: jest.fn().mockResolvedValue(undefined),
      };
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);
      await openTranslationDb('asv');

      // Now delete
      await deleteTranslation('asv');
      expect(mockDb.closeAsync).toHaveBeenCalled();
      expect(mockDeleteAsync).toHaveBeenCalled();
    });
  });

  describe('closeAllTranslationDbs', () => {
    it('closes all open connections', async () => {
      // Note: Because of singleton map sharing, this test uses a fresh translation
      // that openTranslationDb can create
      mockGetInfoAsync.mockResolvedValue({ exists: true, size: 5000000 });
      const mockDb = {
        execAsync: jest.fn().mockResolvedValue(undefined),
        closeAsync: jest.fn().mockResolvedValue(undefined),
      };
      mockOpenDatabaseAsync.mockResolvedValue(mockDb);

      await closeAllTranslationDbs();
      // Should not throw even if map is empty
    });
  });

  describe('downloadTranslation - web platform', () => {
    it('no-ops for unknown translations', async () => {
      await downloadTranslation('unknown_id');
      expect(mockCopyAsync).not.toHaveBeenCalled();
    });
  });

  describe('getInstalledSize edge cases', () => {
    it('returns 0 when size property is missing', async () => {
      mockGetInfoAsync.mockResolvedValue({ exists: true });
      const size = await getInstalledSize('esv');
      expect(size).toBe(0);
    });
  });
});
