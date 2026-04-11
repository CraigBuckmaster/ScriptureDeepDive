/**
 * Tests for db/content/reference.ts — Word studies, synoptic passages, cross-refs, timelines, etc.
 */

jest.mock('@/db/database', () => require('../../helpers/mockDb').mockDatabaseModule());
import { getMockDb, resetMockDb } from '../../helpers/mockDb';

import {
  getAllWordStudies,
  getWordStudy,
  getSynopticEntries,
  getSynopticEntry,
  getHarmonyEntries,
  getHarmonyEntry,
  getOTParallelEntries,
  getCrossRefThreads,
  getCrossRefThread,
  getCrossRefPairsForVerse,
  getTimelineEvents,
  getTimelinePeople,
  getAllTimelineEntries,
  getGenealogyConfig,
  getTimelineEraConfig,
  getEras,
  getEra,
  getRedemptiveActs,
  getRedemptiveAct,
  getLexiconEntry,
  getLexiconEntries,
  getTopics,
  getTopic,
  searchTopics,
} from '@/db/content/reference';

describe('db/content/reference', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  describe('getAllWordStudies', () => {
    it('queries word_studies table', async () => {
      getMockDb().getAllAsync.mockResolvedValue([{ id: 'ws-1' }]);
      const result = await getAllWordStudies();
      expect(result).toHaveLength(1);
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('word_studies'),
      );
    });
  });

  describe('getWordStudy', () => {
    it('returns word study by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'charis', transliteration: 'charis' });
      const result = await getWordStudy('charis');
      expect(result?.id).toBe('charis');
    });

    it('returns null for non-existent id', async () => {
      const result = await getWordStudy('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getSynopticEntries', () => {
    it('queries synoptic_map ordered by sort_order', async () => {
      await getSynopticEntries();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('synoptic_map'),
      );
    });
  });

  describe('getSynopticEntry', () => {
    it('returns entry by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'syn-1' });
      const result = await getSynopticEntry('syn-1');
      expect(result?.id).toBe('syn-1');
    });
  });

  describe('getHarmonyEntries', () => {
    it('filters by gospel categories', async () => {
      await getHarmonyEntries();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('gospel'),
      );
    });
  });

  describe('getHarmonyEntry', () => {
    it('returns harmony entry by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'h-1' });
      expect((await getHarmonyEntry('h-1'))?.id).toBe('h-1');
    });
  });

  describe('getOTParallelEntries', () => {
    it('filters by ot-parallel category', async () => {
      await getOTParallelEntries();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ot-parallel'),
      );
    });
  });

  describe('getCrossRefThreads', () => {
    it('queries cross_ref_threads', async () => {
      await getCrossRefThreads();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('cross_ref_threads'),
      );
    });
  });

  describe('getCrossRefThread', () => {
    it('returns thread by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'th-1', theme: 'Grace' });
      expect((await getCrossRefThread('th-1'))?.theme).toBe('Grace');
    });
  });

  describe('getCrossRefPairsForVerse', () => {
    it('queries both from_ref and to_ref', async () => {
      await getCrossRefPairsForVerse('genesis 1:1');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('from_ref'),
        ['genesis 1:1', 'genesis 1:1'],
      );
    });
  });

  describe('getTimelineEvents', () => {
    it('filters by event category', async () => {
      await getTimelineEvents();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        ['event'],
      );
    });
  });

  describe('getTimelinePeople', () => {
    it('filters by person category', async () => {
      await getTimelinePeople();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('category'),
        ['person'],
      );
    });
  });

  describe('getAllTimelineEntries', () => {
    it('queries all entries ordered by year', async () => {
      await getAllTimelineEntries();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY year'),
      );
    });
  });

  describe('getGenealogyConfig', () => {
    it('returns value_json when found', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ value_json: '{"test": true}' });
      const result = await getGenealogyConfig('test_key');
      expect(result).toBe('{"test": true}');
    });

    it('returns null when not found', async () => {
      const result = await getGenealogyConfig('missing');
      expect(result).toBeNull();
    });
  });

  describe('getTimelineEraConfig', () => {
    it('parses JSON config', async () => {
      const config = { era1: { hex: '#000', name: 'Era 1', pill: 'E1', range: [0, 100] } };
      getMockDb().getFirstAsync.mockResolvedValue({ value_json: JSON.stringify(config) });
      const result = await getTimelineEraConfig();
      expect(result?.era1.name).toBe('Era 1');
    });

    it('returns null when config not found', async () => {
      getMockDb().getFirstAsync.mockResolvedValue(null);
      const result = await getTimelineEraConfig();
      expect(result).toBeNull();
    });

    it('returns null for invalid JSON', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ value_json: 'NOT JSON' });
      const result = await getTimelineEraConfig();
      expect(result).toBeNull();
    });
  });

  describe('getEras', () => {
    it('queries eras ordered by range_start', async () => {
      await getEras();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY range_start'),
      );
    });
  });

  describe('getEra', () => {
    it('returns era by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'era-1', name: 'Test' });
      expect((await getEra('era-1'))?.name).toBe('Test');
    });
  });

  describe('getRedemptiveActs', () => {
    it('queries ordered by act_order', async () => {
      await getRedemptiveActs();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('act_order'),
      );
    });
  });

  describe('getRedemptiveAct', () => {
    it('returns by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'ra-1' });
      expect((await getRedemptiveAct('ra-1'))?.id).toBe('ra-1');
    });
  });

  describe('getLexiconEntry', () => {
    it('queries by strongs number', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ strongs: 'G5485' });
      const result = await getLexiconEntry('G5485');
      expect(result?.strongs).toBe('G5485');
    });
  });

  describe('getLexiconEntries', () => {
    it('returns empty array for empty input', async () => {
      const result = await getLexiconEntries([]);
      expect(result).toEqual([]);
    });

    it('queries multiple strongs numbers', async () => {
      getMockDb().getAllAsync.mockResolvedValue([{ strongs: 'G5485' }, { strongs: 'H2580' }]);
      const result = await getLexiconEntries(['G5485', 'H2580']);
      expect(result).toHaveLength(2);
    });
  });

  describe('getTopics', () => {
    it('queries topics ordered by category', async () => {
      await getTopics();
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY category'),
      );
    });
  });

  describe('getTopic', () => {
    it('returns topic by id', async () => {
      getMockDb().getFirstAsync.mockResolvedValue({ id: 'topic-1', title: 'Test' });
      expect((await getTopic('topic-1'))?.title).toBe('Test');
    });
  });

  describe('searchTopics', () => {
    it('uses FTS MATCH with wildcard', async () => {
      await searchTopics('grace');
      expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('MATCH'),
        ['grace*'],
      );
    });
  });
});
