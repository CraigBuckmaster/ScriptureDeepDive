import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetLexiconEntry = jest.fn();
const mockGetLexiconEntries = jest.fn();

jest.mock('@/db/content', () => ({
  getLexiconEntry: (...args: any[]) => mockGetLexiconEntry(...args),
  getLexiconEntries: (...args: any[]) => mockGetLexiconEntries(...args),
}));

import { useLexicon } from '@/hooks/useLexicon';

const makeLexEntry = (strongs: string) => ({
  strongs,
  language: strongs.startsWith('H') ? 'hebrew' : 'greek',
  lemma: 'test',
  transliteration: 'test',
  pronunciation: null,
  pos: 'Noun',
  definition_json: JSON.stringify({ short: 'test def', full: [] }),
  etymology: null,
  related_strongs_json: JSON.stringify(['G27']),
  source: 'thayer',
});

describe('useLexicon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLexiconEntry.mockResolvedValue(makeLexEntry('G26'));
    mockGetLexiconEntries.mockResolvedValue([makeLexEntry('G27')]);
  });

  it('returns null entry when strongs is null', () => {
    const { result } = renderHook(() => useLexicon(null));
    expect(result.current.entry).toBeNull();
    expect(result.current.related).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('loads entry for given strongs number', async () => {
    const { result } = renderHook(() => useLexicon('G26'));
    await waitFor(() => {
      expect(result.current.entry?.strongs).toBe('G26');
      expect(result.current.loading).toBe(false);
    });
    expect(mockGetLexiconEntry).toHaveBeenCalledWith('G26');
  });

  it('loads related entries from related_strongs_json', async () => {
    const { result } = renderHook(() => useLexicon('G26'));
    await waitFor(() => {
      expect(result.current.related).toHaveLength(1);
      expect(result.current.related[0].strongs).toBe('G27');
    });
    expect(mockGetLexiconEntries).toHaveBeenCalledWith(['G27']);
  });

  it('handles entry with no related strongs', async () => {
    mockGetLexiconEntry.mockResolvedValue({
      ...makeLexEntry('H430'),
      related_strongs_json: null,
    });
    const { result } = renderHook(() => useLexicon('H430'));
    await waitFor(() => {
      expect(result.current.entry?.strongs).toBe('H430');
      expect(result.current.related).toEqual([]);
    });
  });

  it('handles missing lexicon entry gracefully', async () => {
    mockGetLexiconEntry.mockResolvedValue(null);
    const { result } = renderHook(() => useLexicon('G99999'));
    await waitFor(() => {
      expect(result.current.entry).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });
});
