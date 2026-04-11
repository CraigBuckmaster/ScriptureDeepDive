/**
 * Database layer tests for db/content/reference.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
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

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

// ── Word Studies ─────────────────────────────────────────────────

describe('getAllWordStudies', () => {
  it('returns all word studies ordered by transliteration', async () => {
    const studies = [{ id: 'ws1', transliteration: 'agape' }];
    getMockDb().getAllAsync.mockResolvedValue(studies);

    const result = await getAllWordStudies();
    expect(result).toEqual(studies);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('word_studies'),
    );
  });
});

describe('getWordStudy', () => {
  it('returns a word study by id', async () => {
    const study = { id: 'ws1', transliteration: 'agape' };
    getMockDb().getFirstAsync.mockResolvedValue(study);

    const result = await getWordStudy('ws1');
    expect(result).toEqual(study);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('word_studies'),
      ['ws1'],
    );
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getWordStudy('missing');
    expect(result).toBeNull();
  });
});

// ── Synoptic Passages ────────────────────────────────────────────

describe('getSynopticEntries', () => {
  it('returns synoptic entries ordered by title', async () => {
    const entries = [{ id: 'se1', title: 'Feeding of 5000' }];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await getSynopticEntries();
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('synoptic_map'),
    );
  });
});

// ── Cross-Reference Threads ──────────────────────────────────────

describe('getCrossRefThreads', () => {
  it('returns all cross-ref threads ordered by theme', async () => {
    const threads = [{ id: 'crt1', theme: 'Redemption' }];
    getMockDb().getAllAsync.mockResolvedValue(threads);

    const result = await getCrossRefThreads();
    expect(result).toEqual(threads);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('cross_ref_threads'),
    );
  });
});

describe('getCrossRefThread', () => {
  it('returns a thread by id', async () => {
    const thread = { id: 'crt1', theme: 'Redemption' };
    getMockDb().getFirstAsync.mockResolvedValue(thread);

    const result = await getCrossRefThread('crt1');
    expect(result).toEqual(thread);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('cross_ref_threads'),
      ['crt1'],
    );
  });
});

describe('getCrossRefPairsForVerse', () => {
  it('queries both from_ref and to_ref columns', async () => {
    const pairs = [{ id: 'crp1', from_ref: 'gen.1.1', to_ref: 'jhn.1.1' }];
    getMockDb().getAllAsync.mockResolvedValue(pairs);

    const result = await getCrossRefPairsForVerse('gen.1.1');
    expect(result).toEqual(pairs);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('from_ref'),
      ['gen.1.1', 'gen.1.1'],
    );
  });
});

// ── Timeline ─────────────────────────────────────────────────────

describe('getTimelineEvents', () => {
  it('returns timeline entries with category event', async () => {
    const events = [{ id: 't1', category: 'event', year: -4000 }];
    getMockDb().getAllAsync.mockResolvedValue(events);

    const result = await getTimelineEvents();
    expect(result).toEqual(events);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('timelines'),
      ['event'],
    );
  });
});

describe('getTimelinePeople', () => {
  it('returns timeline entries with category person', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await getTimelinePeople();
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('timelines'),
      ['person'],
    );
  });
});

describe('getAllTimelineEntries', () => {
  it('returns all timeline entries ordered by year', async () => {
    const entries = [{ id: 't1', year: -4000 }, { id: 't2', year: 33 }];
    getMockDb().getAllAsync.mockResolvedValue(entries);

    const result = await getAllTimelineEntries();
    expect(result).toEqual(entries);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('timelines'),
    );
  });
});

// ── Genealogy Config ─────────────────────────────────────────────

describe('getGenealogyConfig', () => {
  it('returns value_json for a matching key', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ key: 'era', value_json: '{"a":1}' });

    const result = await getGenealogyConfig('era');
    expect(result).toBe('{"a":1}');
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('genealogy_config'),
      ['era'],
    );
  });

  it('returns null when key not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getGenealogyConfig('missing');
    expect(result).toBeNull();
  });
});

describe('getTimelineEraConfig', () => {
  it('parses JSON from genealogy_config', async () => {
    const eraData = { patriarchs: { hex: '#abc', name: 'Patriarchs', pill: 'P', range: [-2000, -1500] } };
    getMockDb().getFirstAsync.mockResolvedValue({ key: 'timeline_era_config', value_json: JSON.stringify(eraData) });

    const result = await getTimelineEraConfig();
    expect(result).toEqual(eraData);
  });

  it('returns null when config is not present', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getTimelineEraConfig();
    expect(result).toBeNull();
  });

  it('returns null when JSON is invalid', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ key: 'timeline_era_config', value_json: '{bad json' });
    const result = await getTimelineEraConfig();
    expect(result).toBeNull();
  });
});

// ── Synoptic entries (extended) ─────────────────────────────────

describe('getSynopticEntry', () => {
  it('returns entry by id', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ id: 'entry1', title: 'Baptism' });
    const result = await getSynopticEntry('entry1');
    expect(result?.title).toBe('Baptism');
  });
});

describe('getHarmonyEntries', () => {
  it('returns gospel harmony entries', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 'h1' }]);
    const result = await getHarmonyEntries();
    expect(result).toHaveLength(1);
  });
});

describe('getHarmonyEntry', () => {
  it('returns single harmony entry', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ id: 'h1' });
    const result = await getHarmonyEntry('h1');
    expect(result?.id).toBe('h1');
  });
});

describe('getOTParallelEntries', () => {
  it('returns OT parallel entries', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 'ot1' }]);
    const result = await getOTParallelEntries();
    expect(result).toHaveLength(1);
  });
});

// ── Eras ─────────────────────────────────────────────────────────

describe('getEras', () => {
  it('returns all eras ordered by range_start', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 'patriarchs' }]);
    const result = await getEras();
    expect(result).toHaveLength(1);
  });
});

describe('getEra', () => {
  it('returns era by id', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ id: 'patriarchs', name: 'Patriarchs' });
    const result = await getEra('patriarchs');
    expect(result?.name).toBe('Patriarchs');
  });
});

// ── Redemptive Acts ─────────────────────────────────────────────

describe('getRedemptiveActs', () => {
  it('returns all redemptive acts', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 'creation' }]);
    const result = await getRedemptiveActs();
    expect(result).toHaveLength(1);
  });
});

describe('getRedemptiveAct', () => {
  it('returns act by id', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ id: 'creation' });
    const result = await getRedemptiveAct('creation');
    expect(result?.id).toBe('creation');
  });
});

// ── Lexicon ─────────────────────────────────────────────────────

describe('getLexiconEntry', () => {
  it('returns entry by strongs number', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ strongs: 'H1', gloss: 'father' });
    const result = await getLexiconEntry('H1');
    expect(result?.gloss).toBe('father');
  });
});

describe('getLexiconEntries', () => {
  it('returns entries for multiple strongs', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ strongs: 'H1' }, { strongs: 'H2' }]);
    const result = await getLexiconEntries(['H1', 'H2']);
    expect(result).toHaveLength(2);
  });

  it('returns empty for empty list', async () => {
    const result = await getLexiconEntries([]);
    expect(result).toEqual([]);
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });
});

// ── Topics ─────────────────────────────────────────────────────

describe('getTopics', () => {
  it('returns all topics', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 't1' }]);
    const result = await getTopics();
    expect(result).toHaveLength(1);
  });
});

describe('getTopic', () => {
  it('returns topic by id', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ id: 't1', title: 'Grace' });
    const result = await getTopic('t1');
    expect(result?.title).toBe('Grace');
  });
});

describe('searchTopics', () => {
  it('searches topics with FTS', async () => {
    getMockDb().getAllAsync.mockResolvedValue([{ id: 't1' }]);
    const result = await searchTopics('grace');
    expect(result).toHaveLength(1);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('MATCH'),
      ['grace*'],
    );
  });
});
