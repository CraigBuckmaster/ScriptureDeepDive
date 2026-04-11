/**
 * Hook tests for useHermeneuticLens — useAvailableLenses and useChapterLensContent.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetLensesForChapter = jest.fn();
const mockGetChapterLensContent = jest.fn();

jest.mock('@/db/content/hermeneutics', () => ({
  getLensesForChapter: (...args: any[]) => mockGetLensesForChapter(...args),
  getChapterLensContent: (...args: any[]) => mockGetChapterLensContent(...args),
}));

import { useAvailableLenses, useChapterLensContent } from '@/hooks/useHermeneuticLens';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetLensesForChapter.mockResolvedValue([]);
  mockGetChapterLensContent.mockResolvedValue(null);
});

describe('useAvailableLenses', () => {
  it('returns empty array when chapterId is undefined', async () => {
    const { result } = renderHook(() => useAvailableLenses(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('returns lenses for a chapter', async () => {
    const lenses = [{ id: 'historical', name: 'Historical' }];
    mockGetLensesForChapter.mockResolvedValue(lenses);
    const { result } = renderHook(() => useAvailableLenses('genesis_1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(lenses);
  });
});

describe('useChapterLensContent', () => {
  it('returns null when chapterId or lensId missing', async () => {
    const { result } = renderHook(() => useChapterLensContent(undefined, null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('loads content for chapter + lens', async () => {
    const content = { chapter_id: 'genesis_1', lens_id: 'historical', guidance: 'text' };
    mockGetChapterLensContent.mockResolvedValue(content);
    const { result } = renderHook(() => useChapterLensContent('genesis_1', 'historical'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(content);
  });
});
