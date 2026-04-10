/**
 * Tests for db/content/archaeology.ts
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getAllDiscoveries,
  getDiscovery,
  getDiscoveriesForChapter,
  getDiscoveriesByCategory,
  searchDiscoveries,
  getDiscoveryVerseLinks,
  getDiscoveryImages,
} from '@/db/content/archaeology';

describe('db/content/archaeology', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getAllDiscoveries', () => {
    it('queries ordered by display_order', async () => {
      await getAllDiscoveries();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('display_order'),
      );
    });
  });

  describe('getDiscovery', () => {
    it('returns discovery by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'dead-sea-scrolls' });
      const result = await getDiscovery('dead-sea-scrolls');
      expect(result?.id).toBe('dead-sea-scrolls');
    });

    it('returns null when not found', async () => {
      const result = await getDiscovery('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getDiscoveriesForChapter', () => {
    it('queries by verse_ref pattern', async () => {
      await getDiscoveriesForChapter('genesis', 1);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('verse_ref'),
        ['genesis', 1],
      );
    });
  });

  describe('getDiscoveriesByCategory', () => {
    it('queries by category', async () => {
      await getDiscoveriesByCategory('manuscripts');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        ['manuscripts'],
      );
    });
  });

  describe('searchDiscoveries', () => {
    it('returns empty for empty query', async () => {
      const result = await searchDiscoveries('');
      expect(result).toEqual([]);
    });

    it('returns empty for single-char words', async () => {
      const result = await searchDiscoveries('a b');
      expect(result).toEqual([]);
    });

    it('uses FTS MATCH', async () => {
      getMockDb().getAllAsync.mockResolvedValue([{ id: 'dss' }]);
      const result = await searchDiscoveries('Dead Sea');
      expect(result).toHaveLength(1);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['"Dead" "Sea"'],
      );
    });

    it('strips special characters', async () => {
      await searchDiscoveries('"scrolls*" (ancient)');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['"scrolls" "ancient"'],
      );
    });
  });

  describe('getDiscoveryVerseLinks', () => {
    it('queries by discovery_id', async () => {
      await getDiscoveryVerseLinks('dss');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('discovery_id'),
        ['dss'],
      );
    });
  });

  describe('getDiscoveryImages', () => {
    it('queries images ordered by display_order', async () => {
      await getDiscoveryImages('dss');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('display_order'),
        ['dss'],
      );
    });
  });
});
