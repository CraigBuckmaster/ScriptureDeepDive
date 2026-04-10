/**
 * Tests for useConceptData hook.
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
import { useConceptData } from '@/hooks/useConceptData';

beforeEach(() => {
  jest.clearAllMocks();
  resetMockDb();
});

const mockConceptRow = {
  id: 'grace',
  title: 'Grace',
  description: 'Unmerited favor of God',
  theme_key: 'grace_theme',
  word_study_ids_json: '["ws-charis","ws-chen"]',
  thread_ids_json: '["thread-1"]',
  prophecy_chain_ids_json: '["pc-1"]',
  people_tags_json: '["paul"]',
  tags_json: '["soteriological","pauline"]',
  journey_stops_json: JSON.stringify([
    { ref: 'Eph 2:8', book: 'ephesians', chapter: 2, label: 'By grace through faith', development: 'Key declaration', what_changes: 'Salvation framework' },
  ]),
};

describe('useConceptData', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useConceptData('grace'));
    expect(result.current.loading).toBe(true);
    expect(result.current.concept).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading=false and returns early for undefined conceptId', async () => {
    const { result } = renderHook(() => useConceptData(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.concept).toBeNull();
    expect(result.current.error).toBeNull();
    expect(getMockDb().getFirstAsync).not.toHaveBeenCalled();
  });

  it('sets error when concept is not found', async () => {
    getMockDb().getFirstAsync.mockResolvedValue(null);

    const { result } = renderHook(() => useConceptData('nonexistent'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Concept not found');
    expect(result.current.concept).toBeNull();
  });

  it('loads concept and all linked data successfully', async () => {
    // First getFirstAsync call returns the concept row
    getMockDb().getFirstAsync.mockResolvedValueOnce(mockConceptRow);
    // Subsequent getFirstAsync calls are for book name lookups in topChapters
    getMockDb().getFirstAsync.mockResolvedValue({ name: 'Genesis' });

    // getAllAsync calls are made in order: word_studies, prophecy_chains, cross_ref_threads, people, chapter_panels
    getMockDb().getAllAsync
      .mockResolvedValueOnce([ // word studies
        { id: 'ws-charis', language: 'Greek', original: 'χάρις', transliteration: 'charis', strongs: 'G5485', glosses: '["grace","favor"]', range: 'NT-wide', note: 'Key Pauline term' },
        { id: 'ws-chen', language: 'Hebrew', original: 'חֵן', transliteration: 'chen', strongs: 'H2580', glosses: '["grace","favor"]', range: 'OT-wide', note: 'OT equivalent' },
      ])
      .mockResolvedValueOnce([ // prophecy chains
        { id: 'pc-1', title: 'Grace Covenant', category: 'covenantal', summary: 'Grace through the covenants' },
      ])
      .mockResolvedValueOnce([ // cross-ref threads
        { id: 'thread-1', theme: 'Grace and Law', tags_json: '["grace","law"]', steps_json: '[]' },
      ])
      .mockResolvedValueOnce([ // people
        { id: 'paul', name: 'Paul', role: 'apostle', era: 'NT' },
      ])
      .mockResolvedValueOnce([ // chapter_panels for themes
        { chapter_id: 'genesis_1', content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 8 }] }) },
        { chapter_id: 'exodus_3', content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 5 }] }) },
      ]);

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Concept parsed correctly
    expect(result.current.error).toBeNull();
    expect(result.current.concept).toBeTruthy();
    expect(result.current.concept!.id).toBe('grace');
    expect(result.current.concept!.title).toBe('Grace');
    expect(result.current.concept!.word_study_ids).toEqual(['ws-charis', 'ws-chen']);
    expect(result.current.concept!.tags).toEqual(['soteriological', 'pauline']);
    expect(result.current.concept!.journey_stops).toHaveLength(1);

    // Linked data
    expect(result.current.wordStudies).toHaveLength(2);
    expect(result.current.wordStudies[0].glosses).toEqual(['grace', 'favor']);
    expect(result.current.prophecyChains).toHaveLength(1);
    expect(result.current.threads).toHaveLength(1);
    expect(result.current.people).toHaveLength(1);
    expect(result.current.people[0].name).toBe('Paul');

    // Top chapters sorted by score descending
    expect(result.current.topChapters).toHaveLength(2);
    expect(result.current.topChapters[0].score).toBe(8);
    expect(result.current.topChapters[0].book_name).toBe('Genesis');
    expect(result.current.topChapters[1].score).toBe(5);
  });

  it('handles concept with empty linked arrays', async () => {
    const emptyConceptRow = {
      ...mockConceptRow,
      word_study_ids_json: '[]',
      thread_ids_json: '[]',
      prophecy_chain_ids_json: '[]',
      people_tags_json: '[]',
      theme_key: null,
    };
    getMockDb().getFirstAsync.mockResolvedValueOnce(emptyConceptRow);

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.concept).toBeTruthy();
    expect(result.current.wordStudies).toEqual([]);
    expect(result.current.prophecyChains).toEqual([]);
    expect(result.current.threads).toEqual([]);
    expect(result.current.people).toEqual([]);
    expect(result.current.topChapters).toEqual([]);
    // No getAllAsync calls should have been made for linked data
    expect(getMockDb().getAllAsync).not.toHaveBeenCalled();
  });

  it('handles database error gracefully', async () => {
    getMockDb().getFirstAsync.mockRejectedValueOnce(new Error('DB connection lost'));

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load concept data');
    expect(result.current.concept).toBeNull();
  });

  it('skips malformed JSON in chapter_panels without crashing', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      ...mockConceptRow,
      word_study_ids_json: '[]',
      thread_ids_json: '[]',
      prophecy_chain_ids_json: '[]',
      people_tags_json: '[]',
    });
    getMockDb().getAllAsync.mockResolvedValueOnce([
      { chapter_id: 'genesis_1', content_json: 'NOT VALID JSON' },
      { chapter_id: 'exodus_3', content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 7 }] }) },
    ]);
    getMockDb().getFirstAsync.mockResolvedValue({ name: 'Exodus' });

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    // Only the valid chapter should appear
    expect(result.current.topChapters).toHaveLength(1);
    expect(result.current.topChapters[0].book_name).toBe('Exodus');
  });

  it('limits topChapters to 10 results', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      ...mockConceptRow,
      word_study_ids_json: '[]',
      thread_ids_json: '[]',
      prophecy_chain_ids_json: '[]',
      people_tags_json: '[]',
    });

    const manyPanels = Array.from({ length: 15 }, (_, i) => ({
      chapter_id: `genesis_${i + 1}`,
      content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 15 - i }] }),
    }));
    getMockDb().getAllAsync.mockResolvedValueOnce(manyPanels);
    getMockDb().getFirstAsync.mockResolvedValue({ name: 'Genesis' });

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topChapters).toHaveLength(10);
    // Should be sorted by score descending
    expect(result.current.topChapters[0].score).toBe(15);
    expect(result.current.topChapters[9].score).toBe(6);
  });

  it('skips chapters with zero score in theme matching', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      ...mockConceptRow,
      word_study_ids_json: '[]',
      thread_ids_json: '[]',
      prophecy_chain_ids_json: '[]',
      people_tags_json: '[]',
    });
    getMockDb().getAllAsync.mockResolvedValueOnce([
      { chapter_id: 'genesis_1', content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 0 }] }) },
      { chapter_id: 'genesis_2', content_json: JSON.stringify({ scores: [{ label: 'grace_theme', score: 5 }] }) },
    ]);
    getMockDb().getFirstAsync.mockResolvedValue({ name: 'Genesis' });

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.topChapters).toHaveLength(1);
    expect(result.current.topChapters[0].chapter_id).toBe('genesis_2');
  });

  it('handles concept with null journey_stops_json', async () => {
    getMockDb().getFirstAsync.mockResolvedValueOnce({
      ...mockConceptRow,
      journey_stops_json: null,
      word_study_ids_json: '[]',
      thread_ids_json: '[]',
      prophecy_chain_ids_json: '[]',
      people_tags_json: '[]',
      theme_key: null,
    });

    const { result } = renderHook(() => useConceptData('grace'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.concept?.journey_stops).toEqual([]);
  });
});

describe('useConcepts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockDb();
  });

  it('loads all concepts', async () => {
    const { useConcepts } = require('@/hooks/useConceptData');
    getMockDb().getAllAsync.mockResolvedValueOnce([
      {
        id: 'grace',
        title: 'Grace',
        description: 'Unmerited favor',
        theme_key: null,
        word_study_ids_json: '[]',
        thread_ids_json: '[]',
        prophecy_chain_ids_json: '[]',
        people_tags_json: '[]',
        tags_json: '[]',
        journey_stops_json: null,
      },
    ]);

    const { result } = renderHook(() => useConcepts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.concepts).toHaveLength(1);
    expect(result.current.concepts[0].title).toBe('Grace');
  });

  it('handles error gracefully', async () => {
    const { useConcepts } = require('@/hooks/useConceptData');
    getMockDb().getAllAsync.mockRejectedValueOnce(new Error('DB fail'));

    const { result } = renderHook(() => useConcepts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.concepts).toEqual([]);
  });
});
