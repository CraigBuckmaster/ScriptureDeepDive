/**
 * Tests for db/content/people.ts
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getAllPeople,
  getPerson,
  getPersonChildren,
  getSpousesOf,
  getPersonJourney,
  getPersonLegacyRefs,
  hasPersonJourney,
} from '@/db/content/people';

describe('db/content/people', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getAllPeople', () => {
    it('returns people ordered by name', async () => {
      getMockDb().getAllAsync.mockResolvedValue([{ id: 'abraham', name: 'Abraham' }]);
      const result = await getAllPeople();
      expect(result).toHaveLength(1);
    });
  });

  describe('getPerson', () => {
    it('returns person by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'abraham', name: 'Abraham' });
      const result = await getPerson('abraham');
      expect(result?.name).toBe('Abraham');
    });

    it('returns null when not found', async () => {
      expect(await getPerson('nobody')).toBeNull();
    });
  });

  describe('getPersonChildren', () => {
    it('queries by father and mother', async () => {
      await getPersonChildren('abraham');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('father'),
        ['abraham', 'abraham'],
      );
    });
  });

  describe('getSpousesOf', () => {
    it('queries by spouse_of', async () => {
      await getSpousesOf('abraham');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('spouse_of'),
        ['abraham'],
      );
    });
  });

  describe('getPersonJourney', () => {
    it('queries by person_id ordered by stage_order', async () => {
      await getPersonJourney('abraham');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('stage_order'),
        ['abraham'],
      );
    });
  });

  describe('getPersonLegacyRefs', () => {
    it('queries by person_id', async () => {
      await getPersonLegacyRefs('abraham');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('people_legacy_refs'),
        ['abraham'],
      );
    });
  });

  describe('hasPersonJourney', () => {
    it('returns true when count > 0', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ c: 3 });
      expect(await hasPersonJourney('abraham')).toBe(true);
    });

    it('returns false when count is 0', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ c: 0 });
      expect(await hasPersonJourney('nobody')).toBe(false);
    });

    it('returns false when row is null', async () => {
      getMockDb().getFirstAsync.mockResolvedValue(null);
      expect(await hasPersonJourney('nobody')).toBe(false);
    });
  });
});
