/**
 * Database layer tests for db/content/chapters.ts
 */
jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import {
  getChapter,
  getChapterById,
  getSections,
  getSectionPanels,
  getSectionPanelsByType,
  getChapterPanels,
  getChapterPanelByType,
  getVerses,
  getVerse,
  getInterlinearWords,
  getConcordanceResults,
  getConcordanceCount,
  getVHLGroups,
} from '@/db/content/chapters';

beforeEach(() => resetMockDb());

describe('getChapter', () => {
  it('returns a chapter matching bookId and chapter number', async () => {
    const chapter = { id: 'ch1', book_id: 'gen', chapter_num: 1 };
    getMockDb().getFirstAsync.mockResolvedValue(chapter);

    const result = await getChapter('gen', 1);
    expect(result).toEqual(chapter);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('book_id'),
      ['gen', 1],
    );
  });

  it('returns null when chapter not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);
    const result = await getChapter('gen', 999);
    expect(result).toBeNull();
  });
});

describe('getChapterById', () => {
  it('returns a chapter by id', async () => {
    const chapter = { id: 'ch-abc', book_id: 'exo', chapter_num: 3 };
    getMockDb().getFirstAsync.mockResolvedValue(chapter);

    const result = await getChapterById('ch-abc');
    expect(result).toEqual(chapter);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('id'),
      ['ch-abc'],
    );
  });
});

describe('getSections', () => {
  it('returns sections for a chapter ordered by section_num', async () => {
    const sections = [
      { id: 's1', chapter_id: 'ch1', section_num: 1 },
      { id: 's2', chapter_id: 'ch1', section_num: 2 },
    ];
    getMockDb().getAllAsync.mockResolvedValue(sections);

    const result = await getSections('ch1');
    expect(result).toEqual(sections);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('chapter_id'),
      ['ch1'],
    );
  });
});

describe('getSectionPanels', () => {
  it('returns panels for a section', async () => {
    const panels = [{ id: 'sp1', section_id: 's1', panel_type: 'commentary' }];
    getMockDb().getAllAsync.mockResolvedValue(panels);

    const result = await getSectionPanels('s1');
    expect(result).toEqual(panels);
    expect(getMockDb().getAllAsync).toHaveBeenCalled();
  });
});

describe('getSectionPanelsByType', () => {
  it('returns a single panel matching section and type', async () => {
    const panel = { id: 'sp2', section_id: 's1', panel_type: 'map' };
    getMockDb().getFirstAsync.mockResolvedValue(panel);

    const result = await getSectionPanelsByType('s1', 'map');
    expect(result).toEqual(panel);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('panel_type'),
      ['s1', 'map'],
    );
  });
});

describe('getChapterPanels', () => {
  it('returns chapter-level panels', async () => {
    const panels = [{ id: 'cp1', chapter_id: 'ch1', panel_type: 'overview' }];
    getMockDb().getAllAsync.mockResolvedValue(panels);

    const result = await getChapterPanels('ch1');
    expect(result).toEqual(panels);
    expect(getMockDb().getAllAsync).toHaveBeenCalled();
  });
});

describe('getChapterPanelByType', () => {
  it('returns a chapter panel by type', async () => {
    const panel = { id: 'cp2', chapter_id: 'ch1', panel_type: 'timeline' };
    getMockDb().getFirstAsync.mockResolvedValue(panel);

    const result = await getChapterPanelByType('ch1', 'timeline');
    expect(result).toEqual(panel);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('panel_type'),
      ['ch1', 'timeline'],
    );
  });
});

describe('getVerses', () => {
  it('returns verses with default translation niv', async () => {
    const verses = [
      { id: 'v1', book_id: 'gen', chapter_num: 1, verse_num: 1, translation: 'niv', text: 'In the beginning...' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(verses);

    const result = await getVerses('gen', 1);
    expect(result).toEqual(verses);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('translation'),
      ['gen', 1, 'niv'],
    );
  });

  it('accepts a custom translation parameter', async () => {
    getMockDb().getAllAsync.mockResolvedValue([]);

    await getVerses('gen', 1, 'esv');
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.any(String),
      ['gen', 1, 'esv'],
    );
  });
});

describe('getVerse', () => {
  it('returns a single verse', async () => {
    const verse = { id: 'v42', book_id: 'gen', chapter_num: 1, verse_num: 1, translation: 'niv', text: 'In the beginning...' };
    getMockDb().getFirstAsync.mockResolvedValue(verse);

    const result = await getVerse('gen', 1, 1);
    expect(result).toEqual(verse);
    expect(getMockDb().getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('verse_num'),
      ['gen', 1, 1, 'niv'],
    );
  });
});

describe('getInterlinearWords', () => {
  it('returns interlinear word data for a verse', async () => {
    const words = [
      { id: 'iw1', book_id: 'gen', chapter_num: 1, verse_num: 1, word_position: 1, original: 'בְּרֵאשִׁית', transliteration: 'bereshit', strongs: 'H7225' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(words);

    const result = await getInterlinearWords('gen', 1, 1);
    expect(result).toEqual(words);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('interlinear_words'),
      ['gen', 1, 1],
    );
  });
});

describe('getConcordanceResults', () => {
  it('returns concordance results for a strongs number', async () => {
    const results = [
      { book_id: 'gen', chapter_num: 1, verse_num: 1, original: 'בְּרֵאשִׁית', transliteration: 'bereshit', gloss: 'beginning', text: 'In the beginning...', book_name: 'Genesis' },
    ];
    getMockDb().getAllAsync.mockResolvedValue(results);

    const result = await getConcordanceResults('H7225');
    expect(result).toEqual(results);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('strongs'),
      ['H7225'],
    );
  });
});

describe('getConcordanceCount', () => {
  it('returns the count of distinct verses for a strongs number', async () => {
    getMockDb().getFirstAsync.mockResolvedValue({ cnt: 42 });

    const result = await getConcordanceCount('H7225');
    expect(result).toBe(42);
  });

  it('returns 0 when row is null', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);

    const result = await getConcordanceCount('H0000');
    expect(result).toBe(0);
  });
});

describe('getVHLGroups', () => {
  it('returns VHL groups for a chapter', async () => {
    const groups = [{ id: 'vhl1', chapter_id: 'ch1' }];
    getMockDb().getAllAsync.mockResolvedValue(groups);

    const result = await getVHLGroups('ch1');
    expect(result).toEqual(groups);
    expect(getMockDb().getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('vhl_groups'),
      ['ch1'],
    );
  });
});
