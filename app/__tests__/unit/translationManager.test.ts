/**
 * Tests for db/translationManager.ts
 *
 * Mocks expo-sqlite, expo-asset, and expo-file-system to test
 * install/open/delete logic without touching the real filesystem.
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
} from '@/db/translationManager';
const FileSystem = require('expo-file-system/legacy');

describe('translationManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isTranslationInstalled', () => {
    it('returns true for bundled translations', async () => {
      const result = await isTranslationInstalled('kjv');
      expect(result).toBe(true);
    });

    it('returns false when file does not exist', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false, size: 0 });
      // Need a non-bundled translation in the map for this test
      const { TRANSLATION_MAP } = require('@/db/translationRegistry');
      TRANSLATION_MAP.set('esv', { id: 'esv', label: 'ESV', bundled: false, file: 'esv.db', sizeBytes: 5000000 });

      const result = await isTranslationInstalled('esv');
      expect(result).toBe(false);

      // Cleanup
      TRANSLATION_MAP.delete('esv');
    });

    it('returns true when file exists with size', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true, size: 5000000 });
      const { TRANSLATION_MAP } = require('@/db/translationRegistry');
      TRANSLATION_MAP.set('esv', { id: 'esv', label: 'ESV', bundled: false, file: 'esv.db', sizeBytes: 5000000 });

      const result = await isTranslationInstalled('esv');
      expect(result).toBe(true);

      TRANSLATION_MAP.delete('esv');
    });
  });

  describe('getInstalledSize', () => {
    it('returns 0 when not installed', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: false });
      const size = await getInstalledSize('esv');
      expect(size).toBe(0);
    });

    it('returns file size when installed', async () => {
      FileSystem.getInfoAsync.mockResolvedValueOnce({ exists: true, size: 8100000 });
      const size = await getInstalledSize('asv');
      expect(size).toBe(8100000);
    });
  });
});
