/**
 * Database layer tests for db/content/archaeology.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getAllDiscoveries,
  getDiscovery,
  getDiscoveriesForChapter,
  getDiscoveryVerseLinks,
  getDiscoveryImages,
} from '@/db/content/archaeology';

beforeEach(() => resetMockDb());

describe('getAllDiscoveries', () => {
  it('returns discoveries ordered by display_order', async () => {
    const rows = [
      { id: 'dss', name: 'Dead Sea Scrolls', display_order: 1 },
      { id: 'stele', name: 'Tel Dan Stele', display_order: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(rows);
    const result = await getAllDiscoveries();
    expect(result).toEqual(rows);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY display_order'),
    );
  });
});

describe('getDiscovery', () => {
  it('returns a single discovery by id', async () => {
    const disc = { id: 'dss', name: 'Dead Sea Scrolls' };
    getMockDb().getFirstAsync.mockResolvedValue(disc);
    const result = await getDiscovery('dss');
    expect(result).toEqual(disc);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = ?'),
      ['dss'],
    );
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getDiscovery('missing');
    expect(result).toBeNull();
  });
});

describe('getDiscoveriesForChapter', () => {
  it('queries by verse_ref LIKE pattern', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getDiscoveriesForChapter('genesis', 1);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('archaeology_verse_links'),
      ['genesis', 1],
    );
  });
});

describe('getDiscoveryVerseLinks', () => {
  it('returns verse links for a discovery', async () => {
    const links = [{ id: 1, discovery_id: 'dss', verse_ref: 'Isaiah 53:1' }];
    getMockDb().getAllAsync.mockResolvedValue(links);
    const result = await getDiscoveryVerseLinks('dss');
    expect(result).toEqual(links);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('archaeology_verse_links'),
      ['dss'],
    );
  });
});

describe('getDiscoveryImages', () => {
  it('returns images ordered by display_order', async () => {
    const images = [{ id: 1, discovery_id: 'dss', url: 'http://img.jpg' }];
    getMockDb().getAllAsync.mockResolvedValue(images);
    const result = await getDiscoveryImages('dss');
    expect(result).toEqual(images);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('archaeology_images'),
      ['dss'],
    );
  });
});
