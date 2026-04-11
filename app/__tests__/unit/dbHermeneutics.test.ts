/**
 * Database layer tests for db/content/hermeneutics.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getAllLenses,
  getLensesForChapter,
  getChapterLensContent,
} from '@/db/content/hermeneutics';

beforeEach(() => resetMockDb());

describe('getAllLenses', () => {
  it('returns lenses ordered by display_order', async () => {
    const lenses = [
      { id: 'historical', name: 'Historical', display_order: 1 },
      { id: 'literary', name: 'Literary', display_order: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(lenses);
    const result = await getAllLenses();
    expect(result).toEqual(lenses);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('hermeneutic_lenses ORDER BY display_order'),
    );
  });
});

describe('getLensesForChapter', () => {
  it('returns lenses joined with chapter_lens_content', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    await getLensesForChapter('genesis_1');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('chapter_lens_content'),
      ['genesis_1'],
    );
  });
});

describe('getChapterLensContent', () => {
  it('returns content for a chapter + lens pair', async () => {
    const content = { chapter_id: 'genesis_1', lens_id: 'historical', guidance: 'Read carefully' };
    getMockDb().getFirstAsync.mockResolvedValue(content);
    const result = await getChapterLensContent('genesis_1', 'historical');
    expect(result).toEqual(content);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('chapter_id = ? AND lens_id = ?'),
      ['genesis_1', 'historical'],
    );
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    expect(await getChapterLensContent('x', 'y')).toBeNull();
  });
});
