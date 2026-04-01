/**
 * Database layer tests for db/content/people.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getAllPeople, getPerson, getPersonChildren, getSpousesOf } from '@/db/content/people';

beforeEach(() => resetMockDb());

describe('getAllPeople', () => {
  it('returns all people ordered by name', async () => {
    const people = [
      { id: 'p1', name: 'Abraham' },
      { id: 'p2', name: 'Isaac' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(people);

    const result = await getAllPeople();
    expect(result).toEqual(people);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY name'),
    );
  });

  it('returns an empty array when no people exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getAllPeople();
    expect(result).toEqual([]);
  });
});

describe('getPerson', () => {
  it('returns a person by id', async () => {
    const person = { id: 'p1', name: 'Abraham', father: null, mother: null };
    getMockDb().getFirstAsync.mockResolvedValue(person);

    const result = await getPerson('p1');
    expect(result).toEqual(person);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['p1'],
    );
  });

  it('returns null when person not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getPerson('unknown');
    expect(result).toBeNull();
  });
});

describe('getPersonChildren', () => {
  it('returns children where parentId matches father or mother', async () => {
    const children = [
      { id: 'p3', name: 'Jacob', father: 'p2' },
      { id: 'p4', name: 'Esau', father: 'p2' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(children);

    const result = await getPersonChildren('p2');
    expect(result).toEqual(children);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('father'),
      ['p2', 'p2'],
    );
  });
});

describe('getSpousesOf', () => {
  it('returns spouses for a person', async () => {
    const spouses = [{ id: 'p5', name: 'Sarah', spouse_of: 'p1' }];
    getMockDb().getAllAsync.mockResolvedValue(spouses);

    const result = await getSpousesOf('p1');
    expect(result).toEqual(spouses);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('spouse_of'),
      ['p1'],
    );
  });

  it('returns an empty array when no spouses found', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getSpousesOf('p99');
    expect(result).toEqual([]);
  });
});
