/**
 * Hook tests for useInterpretations.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetAllEras = jest.fn();
const mockGetInterpretationsForVerse = jest.fn();
const mockGetInterpretationsForChapter = jest.fn();

jest.mock('@/db/content/interpretations', () => ({
  getAllEras: (...args: any[]) => mockGetAllEras(...args),
  getInterpretationsForVerse: (...args: any[]) => mockGetInterpretationsForVerse(...args),
  getInterpretationsForChapter: (...args: any[]) => mockGetInterpretationsForChapter(...args),
}));

import {
  useInterpretationEras,
  useVerseInterpretations,
  useChapterInterpretations,
} from '@/hooks/useInterpretations';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetAllEras.mockResolvedValue([]);
  mockGetInterpretationsForVerse.mockResolvedValue([]);
  mockGetInterpretationsForChapter.mockResolvedValue([]);
});

describe('useInterpretationEras', () => {
  it('loads eras', async () => {
    const eras = [{ id: 'patristic', name: 'Patristic' }];
    mockGetAllEras.mockResolvedValue(eras);
    const { result } = renderHook(() => useInterpretationEras());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(eras);
  });
});

describe('useVerseInterpretations', () => {
  it('loads interpretations for a verse', async () => {
    const interps = [{ id: 'int1', verse_ref: 'gen 1:1', era: 'patristic' }];
    mockGetInterpretationsForVerse.mockResolvedValue(interps);
    const { result } = renderHook(() => useVerseInterpretations('gen 1:1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(interps);
  });
});

describe('useChapterInterpretations', () => {
  it('loads interpretations for a chapter', async () => {
    mockGetInterpretationsForChapter.mockResolvedValue([]);
    const { result } = renderHook(() => useChapterInterpretations('genesis', 1));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });
});
