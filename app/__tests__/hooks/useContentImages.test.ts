/**
 * Hook tests for useContentImages.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetContentImages = jest.fn();

jest.mock('@/db/content/images', () => ({
  getContentImages: (...args: any[]) => mockGetContentImages(...args),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { useContentImages } from '@/hooks/useContentImages';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetContentImages.mockResolvedValue([]);
});

describe('useContentImages', () => {
  it('returns empty images when contentId is undefined', async () => {
    const { result } = renderHook(() => useContentImages('people', undefined));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.images).toEqual([]);
  });

  it('loads images for a valid content item', async () => {
    const images = [
      { id: 1, content_type: 'people', content_id: 'moses', url: 'http://img.jpg' },
    ];
    mockGetContentImages.mockResolvedValue(images);
    const { result } = renderHook(() => useContentImages('people', 'moses'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.images).toEqual(images);
  });

  it('handles errors gracefully', async () => {
    mockGetContentImages.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useContentImages('people', 'moses'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.images).toEqual([]);
  });
});
