/**
 * Hook tests for useGrammar — useGrammarArticle and useMorphologyDecode.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetGrammarArticle = jest.fn();

jest.mock('@/db/content/grammar', () => ({
  getGrammarArticle: (...args: any[]) => mockGetGrammarArticle(...args),
}));

jest.mock('@/utils/morphologyDecoder', () => ({
  decodeMorphology: jest.fn((code: string) => ({ code, parts: ['verb', 'qal'] })),
}));

import { useGrammarArticle, useMorphologyDecode } from '@/hooks/useGrammar';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetGrammarArticle.mockResolvedValue(null);
});

describe('useGrammarArticle', () => {
  it('returns null article when id is null', () => {
    const { result } = renderHook(() => useGrammarArticle(null));
    expect(result.current.article).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads article by id', async () => {
    const article = { id: 'qal', title: 'Qal Stem', language: 'hebrew' };
    mockGetGrammarArticle.mockResolvedValue(article);
    const { result } = renderHook(() => useGrammarArticle('qal'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.article).toEqual(article);
  });
});

describe('useMorphologyDecode', () => {
  it('returns null when code is null', () => {
    const { result } = renderHook(() => useMorphologyDecode(null));
    expect(result.current).toBeNull();
  });

  it('decodes a morphology code', () => {
    const { result } = renderHook(() => useMorphologyDecode('V-QAI'));
    expect(result.current).toEqual({ code: 'V-QAI', parts: ['verb', 'qal'] });
  });
});
