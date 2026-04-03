/**
 * Database layer tests for db/content/dictionary.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getAllDictionaryEntries,
  getDictionaryEntry,
  searchDictionary,
  getDictionaryEntriesByIds,
} from '@/db/content/dictionary';

beforeEach(() => resetMockDb());

describe('getAllDictionaryEntries', () => {
  it('returns all entries from the database', async () => {
    const entries = [
      { id: 'aaron', term: 'Aaron' },
      { id: 'babel', term: 'Babel' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await getAllDictionaryEntries();
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY term'),
    );
  });

  it('returns an empty array when no entries exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getAllDictionaryEntries();
    expect(result).toEqual([]);
  });
});

describe('getDictionaryEntry', () => {
  it('returns an entry by id', async () => {
    const entry = { id: 'aaron', term: 'Aaron', definition: 'Brother of Moses' };
    getMockDb().getFirstAsync.mockResolvedValue(entry);

    const result = await getDictionaryEntry('aaron');
    expect(result).toEqual(entry);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['aaron'],
    );
  });

  it('returns null when entry not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getDictionaryEntry('nonexistent');
    expect(result).toBeNull();
  });
});

describe('searchDictionary', () => {
  it('performs FTS MATCH search with wildcard appended', async () => {
    const entries = [{ id: 'aaron', term: 'Aaron' }];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await searchDictionary('aaro');
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('MATCH'),
      ['aaro*'],
    );
  });

  it('returns an empty array when no matches found', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await searchDictionary('zzz');
    expect(result).toEqual([]);
  });
});

describe('getDictionaryEntriesByIds', () => {
  it('returns empty array for empty ids list', async () => {
    const result = await getDictionaryEntriesByIds([]);
    expect(result).toEqual([]);
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });

  it('generates correct IN placeholders for non-empty ids', async () => {
    const entries = [
      { id: 'aaron', term: 'Aaron' },
      { id: 'babel', term: 'Babel' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await getDictionaryEntriesByIds(['aaron', 'babel']);
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('IN (?,?)'),
      ['aaron', 'babel'],
    );
  });

  it('generates a single placeholder for one id', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 'aaron', term: 'Aaron' }]);

    await getDictionaryEntriesByIds(['aaron']);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('IN (?)'),
      ['aaron'],
    );
  });
});
