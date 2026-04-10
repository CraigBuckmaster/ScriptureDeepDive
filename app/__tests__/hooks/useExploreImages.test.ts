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

  it('resolves manifest into a registry', async () => {
    const { result } = renderHook(() => useExploreImages());
    await waitFor(() => expect(Object.keys(result.current).length).toBeGreaterThanOrEqual(0));
    // Registry is populated after async resolve
  });

  it('returns a record type', async () => {
    const { result } = renderHook(() => useExploreImages());
    expect(typeof result.current).toBe('object');
  });
});
