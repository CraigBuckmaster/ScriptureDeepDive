/**
 * Tests for useDifficultPassages and useDifficultPassage hooks.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());
jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  safeParse: jest.fn((json: string, fallback: unknown) => {
    try { return JSON.parse(json); } catch { return fallback; }
  }),
}));

import { getMockDb, resetMockDb } from '../helpers/mockDb';
import { useDifficultPassages, useDifficultPassage } from '@/hooks/useDifficultPassages';

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

const mockPassageRow = {
  id: 'dp-1',
  title: 'The Conquest of Canaan',
  category: 'ethical',
  severity: 'major',
  passage: 'Joshua 6-11',
  question: 'How do we understand the divine command to destroy the Canaanites?',
  context: 'Ancient Near Eastern warfare context',
  consensus: 'Multiple scholarly approaches exist',
  key_verses_json: JSON.stringify([
    { ref: 'Josh 6:21', text: 'They devoted the city to the LORD' },
    { ref: 'Deut 9:5', text: 'Because of the wickedness of these nations' },
  ]),
  responses_json: JSON.stringify([
    { tradition: 'Reformed', scholar_id: 'sch-1', summary: 'Divine judgment perspective', key_verses: ['Josh 6:21'], strengths: 'Textually grounded', weaknesses: 'Difficult ethically' },
    { tradition: 'Anabaptist', scholar_id: 'sch-2', summary: 'Christocentric re-reading', strengths: 'Emphasizes NT lens', weaknesses: 'May undercut OT authority' },
  ]),
  related_chapters_json: JSON.stringify([
    { book_dir: 'joshua', chapter_num: 6 },
    { book_dir: 'deuteronomy', chapter_num: 9 },
  ]),
  further_reading_json: JSON.stringify([
    { author: 'Paul Copan', title: 'Is God a Moral Monster?', year: 2011 },
  ]),
  tags_json: '["ethics","old-testament","warfare"]',
};

const mockPassageRowMinimal = {
  id: 'dp-2',
  title: 'Psalm 137:9',
  category: 'ethical',
  severity: 'moderate',
  passage: 'Psalm 137:9',
  question: 'What do imprecatory psalms mean?',
  context: null,
  consensus: null,
  key_verses_json: null,
  responses_json: '[]',
  related_chapters_json: null,
  further_reading_json: null,
  tags_json: null,
};

// ─── useDifficultPassages (list) ─────────────────────────────────

describe('useDifficultPassages', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useDifficultPassages());
    expect(result.current.loading).toBe(true);
    expect(result.current.passages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads and parses all passages with JSON fields', async () => {
    getMockDb().getAllAsync.mockResolvedValueOnce([mockPassageRow, mockPassageRowMinimal]);

    const { result } = renderHook(() => useDifficultPassages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.passages).toHaveLength(2);

    // Full passage with all JSON fields
    const first = result.current.passages[0];
    expect(first.id).toBe('dp-1');
    expect(first.category).toBe('ethical');
    expect(first.severity).toBe('major');
    expect(first.context).toBe('Ancient Near Eastern warfare context');
    expect(first.key_verses).toHaveLength(2);
    expect(first.key_verses[0].ref).toBe('Josh 6:21');
    expect(first.responses).toHaveLength(2);
    expect(first.responses[0].scholar_id).toBe('sch-1');
    expect(first.related_chapters).toHaveLength(2);
    expect(first.further_reading).toHaveLength(1);
    expect(first.further_reading[0].author).toBe('Paul Copan');
    expect(first.tags).toEqual(['ethics', 'old-testament', 'warfare']);

    // Minimal passage with null JSON fields -> empty arrays
    const second = result.current.passages[1];
    expect(second.id).toBe('dp-2');
    expect(second.context).toBeUndefined();
    expect(second.consensus).toBeUndefined();
    expect(second.key_verses).toEqual([]);
    expect(second.responses).toEqual([]);
    expect(second.related_chapters).toEqual([]);
    expect(second.further_reading).toEqual([]);
    expect(second.tags).toEqual([]);
  });

  it('returns empty array when no passages exist', async () => {
    getMockDb().getAllAsync.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDifficultPassages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.passages).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles database error gracefully', async () => {
    getMockDb().getAllAsync.mockRejectedValueOnce(new Error('DB error'));

    const { result } = renderHook(() => useDifficultPassages());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load difficult passages');
    expect(result.current.passages).toEqual([]);
  });
});

// ─── useDifficultPassage (detail) ────────────────────────────────

describe('useDifficultPassage', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useDifficultPassage('dp-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.passage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading=false and returns early for undefined passageId', async () => {
    const { result } = renderHook(() => useDifficultPassage(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.passage).toBeNull();
    expect(result.current.error).toBeNull();
    expect(getMockDb().getFirstAsync).not.toHaveBeenCalled();
  });

  it('sets error when passage is not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useDifficultPassage('nonexistent'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Passage not found');
    expect(result.current.passage).toBeNull();
  });

  it('loads passage with scholar info and related chapters', async () => {
    // getFirstAsync: passage row
    getMockDb().getFirstAsync.mockResolvedValueOnce(mockPassageRow);

    // getAllAsync call 1: scholar rows
    getMockDb().getAllAsync
      .mockResolvedValueOnce([
        { id: 'sch-1', name: 'D.A. Carson', tradition: 'Reformed' },
        { id: 'sch-2', name: 'Greg Boyd', tradition: 'Anabaptist' },
      ])
      // getAllAsync call 2: book name rows
      .mockResolvedValueOnce([
        { id: 'joshua', name: 'Joshua' },
        { id: 'deuteronomy', name: 'Deuteronomy' },
      ]);

    const { result } = renderHook(() => useDifficultPassage('dp-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();

    // Passage parsed
    expect(result.current.passage).toBeTruthy();
    expect(result.current.passage!.id).toBe('dp-1');
    expect(result.current.passage!.responses).toHaveLength(2);
    expect(result.current.passage!.key_verses).toHaveLength(2);
    expect(result.current.passage!.further_reading[0].year).toBe(2011);

    // Scholars map populated
    expect(result.current.scholars.size).toBe(2);
    expect(result.current.scholars.get('sch-1')!.name).toBe('D.A. Carson');
    expect(result.current.scholars.get('sch-2')!.tradition).toBe('Anabaptist');

    // Related chapters enriched with book names
    expect(result.current.relatedChapters).toHaveLength(2);
    expect(result.current.relatedChapters[0]).toEqual({
      book_dir: 'joshua',
      chapter_num: 6,
      book_name: 'Joshua',
    });
    expect(result.current.relatedChapters[1]).toEqual({
      book_dir: 'deuteronomy',
      chapter_num: 9,
      book_name: 'Deuteronomy',
    });
  });

  it('handles passage with no responses and no related chapters', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce(mockPassageRowMinimal);

    const { result } = renderHook(() => useDifficultPassage('dp-2'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.passage!.id).toBe('dp-2');
    expect(result.current.passage!.responses).toEqual([]);
    expect(result.current.scholars.size).toBe(0);
    expect(result.current.relatedChapters).toEqual([]);
    // No getAllAsync calls should be made when there are no scholar IDs or related chapters
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });

  it('falls back to book_dir when book name is not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      ...mockPassageRow,
      responses_json: '[]',
      related_chapters_json: JSON.stringify([{ book_dir: 'unknown_book', chapter_num: 1 }]),
    });
    // Book lookup returns no match
    getMockDb().getAllAsync.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDifficultPassage('dp-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.relatedChapters).toHaveLength(1);
    expect(result.current.relatedChapters[0].book_name).toBe('unknown_book');
  });

  it('handles database error gracefully', async () => {
    getMockDb().getFirstAsync.mockRejectedValueOnce(new Error('Connection failed'));

    const { result } = renderHook(() => useDifficultPassage('dp-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load passage data');
    expect(result.current.passage).toBeNull();
  });
});
