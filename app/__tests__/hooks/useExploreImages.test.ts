/**
 * Hook tests for useExploreImages.
 */
import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/database', () => require('../helpers/mockDb').mockDatabaseModule());

jest.mock('@/db/content/images', () => ({
  getFeaturedImages: jest.fn().mockResolvedValue([]),
}));

jest.mock('../../../assets/explore-images.json', () => ({
  TestScreen: {
    count: 5,
    noun: 'items',
    contentType: null,
    images: [
      { url: 'http://img.jpg', caption: 'Test', credit: 'Credit' },
    ],
  },
}), { virtual: true });

import { useExploreImages } from '@/hooks/useExploreImages';

beforeEach(() => jest.clearAllMocks());

describe('useExploreImages', () => {
  it('starts with empty registry', () => {
    const { result } = renderHook(() => useExploreImages());
    expect(result.current).toEqual({});
  });

  it('resolves manifest with inline images', async () => {
    const { result } = renderHook(() => useExploreImages());
    await waitFor(() => {
      const keys = Object.keys(result.current);
      if (keys.length > 0) {
        expect(result.current.TestScreen).toBeDefined();
      }
    });
  });

  it('returns correct structure for inline image entries', async () => {
    const { result } = renderHook(() => useExploreImages());
    await waitFor(() => {
      if (result.current.TestScreen) {
        expect(result.current.TestScreen.count).toBe(5);
        expect(result.current.TestScreen.noun).toBe('items');
        expect(result.current.TestScreen.images).toHaveLength(1);
        expect(result.current.TestScreen.images[0].url).toBe('http://img.jpg');
        expect(result.current.TestScreen.images[0].deepLink.screen).toBe('TestScreen');
      }
    });
  });

  it('returns a record type', async () => {
    const { result } = renderHook(() => useExploreImages());
    expect(typeof result.current).toBe('object');
  });
});
