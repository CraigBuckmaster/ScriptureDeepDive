/**
 * Database layer tests for db/content/places.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { getPlaces, getPlace, getMapStories, getMapStory } from '@/db/content/places';

beforeEach(() => resetMockDb());

describe('getPlaces', () => {
  it('returns all places ordered by priority and ancient_name', async () => {
    const places = [
      { id: 'pl1', ancient_name: 'Jerusalem', priority: 1 },
      { id: 'pl2', ancient_name: 'Bethlehem', priority: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(places);

    const result = await getPlaces();
    expect(result).toEqual(places);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY priority'),
    );
  });

  it('returns an empty array when no places exist', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);
    const result = await getPlaces();
    expect(result).toEqual([]);
  });
});

describe('getPlace', () => {
  it('returns a place by id', async () => {
    const place = { id: 'pl1', ancient_name: 'Jerusalem' };
    getMockDb().getFirstAsync.mockResolvedValue(place);

    const result = await getPlace('pl1');
    expect(result).toEqual(place);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['pl1'],
    );
  });

  it('returns null when place not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getPlace('unknown');
    expect(result).toBeNull();
  });
});

describe('getMapStories', () => {
  it('returns all map stories when no era is specified', async () => {
    const stories = [
      { id: 'ms1', name: 'Exodus Route', era: 'ot' },
      { id: 'ms2', name: 'Paul Journeys', era: 'nt' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(stories);

    const result = await getMapStories();
    expect(result).toEqual(stories);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY era'),
    );
  });

  it('returns map stories filtered by era', async () => {
    const stories = [{ id: 'ms1', name: 'Exodus Route', era: 'ot' }];
    getMockDb().getAllAsync.mockResolvedValue(stories);

    const result = await getMapStories('ot');
    expect(result).toEqual(stories);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('era = ?'),
      ['ot'],
    );
  });
});

describe('getMapStory', () => {
  it('returns a map story by id', async () => {
    const story = { id: 'ms1', name: 'Exodus Route', era: 'ot' };
    getMockDb().getFirstAsync.mockResolvedValue(story);

    const result = await getMapStory('ms1');
    expect(result).toEqual(story);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['ms1'],
    );
  });

  it('returns null when map story not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getMapStory('unknown');
    expect(result).toBeNull();
  });
});
