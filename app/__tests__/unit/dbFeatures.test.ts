/**
 * Database layer tests for db/content/features.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getAllProphecyChains,
  getProphecyChain,
  getProphecyChainsByCategory,
  getProphecyChainsForChapter,
  getAllConcepts,
  getConcept,
  getAllDifficultPassages,
  getDifficultPassage,
  getDifficultPassagesByCategory,
  getDifficultPassagesForChapter,
} from '@/db/content/features';

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

// ── Prophecy Chains ──────────────────────────────────────────────

describe('getAllProphecyChains', () => {
  it('returns all prophecy chains ordered by title', async () => {
    const chains = [{ id: 'pc1', title: 'Abrahamic Covenant' }];
    getMockDb().getAllAsync.mockResolvedValue(chains);

    const result = await getAllProphecyChains();
    expect(result).toEqual(chains);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('prophecy_chains'),
    );
  });
});

describe('getProphecyChain', () => {
  it('returns a single prophecy chain by id', async () => {
    const chain = { id: 'pc1', title: 'Abrahamic Covenant' };
    getMockDb().getFirstAsync.mockResolvedValue(chain);

    const result = await getProphecyChain('pc1');
    expect(result).toEqual(chain);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['pc1'],
    );
  });

  it('returns null when not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getProphecyChain('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getProphecyChainsByCategory', () => {
  it('returns chains filtered by category', async () => {
    const chains = [{ id: 'pc2', title: 'Messianic', category: 'messianic' }];
    getMockDb().getAllAsync.mockResolvedValue(chains);

    const result = await getProphecyChainsByCategory('messianic');
    expect(result).toEqual(chains);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('category'),
      ['messianic'],
    );
  });
});

describe('getProphecyChainsForChapter', () => {
  it('uses LIKE to match bookDir and chapterNum in JSON', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await getProphecyChainsForChapter('genesis', 3);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('links_json'),
      [`%"book_dir":"genesis"%`, `%"chapter_num":3%`],
    );
  });
});

// ── Concepts (backed by journeys table) ──────────────────────────

describe('getAllConcepts', () => {
  it('returns all concepts from journeys table ordered by name', async () => {
    const concepts = [{ id: 'c1', name: 'Grace' }];
    getMockDb().getAllAsync.mockResolvedValue(concepts);

    const result = await getAllConcepts();
    expect(result).toEqual(concepts);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('journeys'),
    );
  });
});

describe('getConcept', () => {
  it('returns a concept by id from journeys table', async () => {
    const concept = { id: 'c1', name: 'Grace' };
    getMockDb().getFirstAsync.mockResolvedValue(concept);

    const result = await getConcept('c1');
    expect(result).toEqual(concept);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('journeys'),
      ['c1'],
    );
  });
});

// ── Difficult Passages ───────────────────────────────────────────

describe('getAllDifficultPassages', () => {
  it('returns all difficult passages ordered by title', async () => {
    const passages = [{ id: 'dp1', title: 'Sons of God' }];
    getMockDb().getAllAsync.mockResolvedValue(passages);

    const result = await getAllDifficultPassages();
    expect(result).toEqual(passages);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('difficult_passages'),
    );
  });
});

describe('getDifficultPassage', () => {
  it('returns a passage by id', async () => {
    const passage = { id: 'dp1', title: 'Sons of God' };
    getMockDb().getFirstAsync.mockResolvedValue(passage);

    const result = await getDifficultPassage('dp1');
    expect(result).toEqual(passage);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['dp1'],
    );
  });
});

describe('getDifficultPassagesByCategory', () => {
  it('returns passages filtered by category', async () => {
    const passages = [{ id: 'dp2', title: 'Nephilim', category: 'genesis' }];
    getMockDb().getAllAsync.mockResolvedValue(passages);

    const result = await getDifficultPassagesByCategory('genesis');
    expect(result).toEqual(passages);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('category'),
      ['genesis'],
    );
  });
});

describe('getDifficultPassagesForChapter', () => {
  it('uses LIKE to match bookDir and chapterNum in JSON', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await getDifficultPassagesForChapter('genesis', 6);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('related_chapters_json'),
      [`%"book_dir":"genesis"%`, `%"chapter_num":6%`],
    );
  });
});
