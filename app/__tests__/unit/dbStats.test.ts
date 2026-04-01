/**
 * Database layer tests for db/content/stats.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getContentStats } from '@/db/content/stats';

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

describe('getContentStats', () => {
  it('returns all counts from parallel queries', async () => {
    getMockDb().getFirstAsync
      .mockResolvedValueOnce({ c: 10 })  // books
      .mockResolvedValueOnce({ c: 200 }) // chapters
      .mockResolvedValueOnce({ c: 15 })  // scholars
      .mockResolvedValueOnce({ c: 50 })  // people
      .mockResolvedValueOnce({ c: 30 })  // timelines
      .mockResolvedValueOnce({ c: 8 })   // prophecy_chains
      .mockResolvedValueOnce({ c: 12 })  // concepts
      .mockResolvedValueOnce({ c: 5 });  // difficult_passages

    const result = await getContentStats();
    expect(result).toEqual({
      liveBooks: 10,
      liveChapters: 200,
      scholarCount: 15,
      peopleCount: 50,
      timelineCount: 30,
      prophecyChainCount: 8,
      conceptCount: 12,
      difficultPassageCount: 5,
    });
  });

  it('issues 8 separate count queries', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ c: 0 });

    await getContentStats();
    expect(getMockDb().getFirstAsync).toHaveBeenCalledTimes(8);
  });

  it('queries books with is_live = 1 filter', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ c: 0 });

    await getContentStats();
    // The first call should be the books query with is_live filter
    const firstCall = getMockDb().getFirstAsync.mock.calls[0][0] as string;
    expect(firstCall).toContain('is_live');
    expect(firstCall).toContain('books');
  });

  it('defaults to 0 when a query returns null', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);

    const result = await getContentStats();
    expect(result).toEqual({
      liveBooks: 0,
      liveChapters: 0,
      scholarCount: 0,
      peopleCount: 0,
      timelineCount: 0,
      prophecyChainCount: 0,
      conceptCount: 0,
      difficultPassageCount: 0,
    });
  });
});
