/**
 * Database layer tests for db/content/scholars.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getAllScholars, getScholar, getScholarsForBook } from '@/db/content/scholars';

beforeEach(() => resetMockDb());

describe('getAllScholars', () => {
  it('returns all scholars ordered by name', async () => {
    const scholars = [
      { id: 's1', name: 'Dr. Smith' },
      { id: 's2', name: 'Prof. Jones' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(scholars);

    const result = await getAllScholars();
    expect(result).toEqual(scholars);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY name'),
    );
  });

  it('returns an empty array when no scholars exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getAllScholars();
    expect(result).toEqual([]);
  });
});

describe('getScholar', () => {
  it('returns a scholar by id', async () => {
    const scholar = { id: 's1', name: 'Dr. Smith' };
    getMockDb().getFirstAsync.mockResolvedValue(scholar);

    const result = await getScholar('s1');
    expect(result).toEqual(scholar);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['s1'],
    );
  });

  it('returns null when scholar not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getScholar('unknown');
    expect(result).toBeNull();
  });
});

describe('getScholarsForBook', () => {
  it('returns scholars scoped to a specific book', async () => {
    const scholars = [{ id: 's1', name: 'Dr. Smith', scope_json: '["gen","exo"]' }];
    getMockDb().getAllAsync.mockResolvedValue(scholars);

    const result = await getScholarsForBook('gen');
    expect(result).toEqual(scholars);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('scope_json'),
      ['gen'],
    );
  });

  it('returns an empty array when no scholars match the book', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getScholarsForBook('rev');
    expect(result).toEqual([]);
  });
});
