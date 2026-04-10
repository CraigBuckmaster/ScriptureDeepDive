/**
 * Database layer tests for db/content/images.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getContentImages, getFeaturedImages } from '@/db/content/images';

beforeEach(() => resetMockDb());

describe('getContentImages', () => {
  it('returns images for a content type and id', async () => {
    const images = [
      { id: 1, content_type: 'people', content_id: 'moses', url: 'http://img.jpg', display_order: 0 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(images);
    const result = await getContentImages('people', 'moses');
    expect(result).toEqual(images);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('content_images'),
      ['people', 'moses'],
    );
  });

  it('returns empty array on error', async () => {
    getMockDb().getAllAsync.mockRejectedValue(new Error('no table'));
    const result = await getContentImages('people', 'moses');
    expect(result).toEqual([]);
  });
});

describe('getFeaturedImages', () => {
  it('returns images for multiple content ids', async () => {
    const images = [
      { id: 1, content_type: 'people', content_id: 'moses', url: 'http://img1.jpg' },
      { id: 2, content_type: 'people', content_id: 'david', url: 'http://img2.jpg' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(images);
    const result = await getFeaturedImages('people', ['moses', 'david']);
    expect(result).toEqual(images);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('IN'),
      ['people', 'moses', 'david'],
    );
  });

  it('returns empty array for empty contentIds', async () => {
    const result = await getFeaturedImages('people', []);
    expect(result).toEqual([]);
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });

  it('returns empty array on error', async () => {
    getMockDb().getAllAsync.mockRejectedValue(new Error('no table'));
    const result = await getFeaturedImages('people', ['moses']);
    expect(result).toEqual([]);
  });
});
