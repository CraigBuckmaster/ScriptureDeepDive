/**
 * Hook tests for hooks/useDictionary.ts
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockEntries = [
  {
    id: 'aaron',
    term: 'Aaron',
    definition: 'Brother of Moses...',
    category: 'people',
    refs_json: '["Ex 4:14"]',
    related_json: '["moses"]',
    cross_person_id: 'aaron',
    cross_place_id: null,
    cross_word_study_id: null,
    cross_concept_id: null,
    source: 'easton',
  },
  {
    id: 'babel',
    term: 'Babel',
    definition: 'Tower in Shinar...',
    category: 'places',
    refs_json: '["Gen 11:9"]',
    related_json: '[]',
    cross_person_id: null,
    cross_place_id: 'babel',
    cross_word_study_id: null,
    cross_concept_id: null,
    source: 'easton',
  },
];

jest.mock('@/db/content/dictionary', () => ({
  getAllDictionaryEntries: jest.fn(() => Promise.resolve(mockEntries)),
  getDictionaryEntry: jest.fn((id: string) =>
    Promise.resolve(mockEntries.find((e) => e.id === id) || null),
  ),
  searchDictionary: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { useDictionaryBrowse, useDictionaryDetail } from '@/hooks/useDictionary';

describe('useDictionaryBrowse', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { result } = renderHook(() => useDictionaryBrowse());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns sections grouped by first letter', async () => {
    const { result } = renderHook(() => useDictionaryBrowse());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.sections).toHaveLength(2);
    expect(result.current.sections[0].letter).toBe('A');
    expect(result.current.sections[0].data).toHaveLength(1);
    expect(result.current.sections[0].data[0].term).toBe('Aaron');
    expect(result.current.sections[1].letter).toBe('B');
    expect(result.current.sections[1].data).toHaveLength(1);
    expect(result.current.sections[1].data[0].term).toBe('Babel');
  });

  it('returns availableLetters as a set of first letters', async () => {
    const { result } = renderHook(() => useDictionaryBrowse());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.availableLetters).toBeInstanceOf(Set);
    expect(result.current.availableLetters.has('A')).toBe(true);
    expect(result.current.availableLetters.has('B')).toBe(true);
    expect(result.current.availableLetters.has('C')).toBe(false);
  });

  it('transitions isLoading from true to false', async () => {
    const { result } = renderHook(() => useDictionaryBrowse());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

describe('useDictionaryDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns parsed entry with refs and related arrays', async () => {
    const { result } = renderHook(() => useDictionaryDetail('aaron'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.entry).not.toBeNull();
    expect(result.current.entry!.term).toBe('Aaron');
    expect(result.current.entry!.refs).toEqual(['Ex 4:14']);
    expect(result.current.entry!.related).toEqual(['moses']);
    expect(result.current.entry!.crossLinks.personId).toBe('aaron');
  });

  it('returns null entry for a non-existent id', async () => {
    const { result } = renderHook(() => useDictionaryDetail('nonexistent'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.entry).toBeNull();
  });
});
