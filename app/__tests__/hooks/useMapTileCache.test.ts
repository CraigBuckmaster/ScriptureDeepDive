import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@maplibre/maplibre-react-native', () => ({
  OfflineManager: {
    createPack: jest.fn().mockResolvedValue(undefined),
    getPack: jest.fn().mockResolvedValue(null),
    setMaximumAmbientCacheSize: jest.fn().mockResolvedValue(undefined),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { OfflineManager } = require('@maplibre/maplibre-react-native');
import { useMapTileCache } from '@/hooks/useMapTileCache';

beforeEach(() => {
  (OfflineManager.createPack as jest.Mock).mockClear().mockResolvedValue(undefined);
  (OfflineManager.getPack as jest.Mock).mockClear().mockResolvedValue(null);
  (OfflineManager.setMaximumAmbientCacheSize as jest.Mock)
    .mockClear()
    .mockResolvedValue(undefined);
});

describe('useMapTileCache', () => {
  it('sets ambient cache to 75 MB on mount', async () => {
    renderHook(() => useMapTileCache('https://example/ancient.json'));
    await waitFor(() =>
      expect(OfflineManager.setMaximumAmbientCacheSize).toHaveBeenCalledWith(
        75 * 1024 * 1024,
      ),
    );
  });

  it('creates the biblical-region offline pack when it does not exist', async () => {
    renderHook(() => useMapTileCache('https://example/ancient.json'));
    await waitFor(() => expect(OfflineManager.createPack).toHaveBeenCalled());
    const call = (OfflineManager.createPack as jest.Mock).mock.calls[0][0];
    expect(call).toMatchObject({
      name: 'biblical-region-base',
      styleURL: 'https://example/ancient.json',
      minZoom: 0,
      maxZoom: 7,
    });
    // bounds: [[neLng, neLat], [swLng, swLat]]
    expect(call.bounds).toEqual([[55, 45], [25, 20]]);
  });

  it('skips pack creation when the pack is already present', async () => {
    (OfflineManager.getPack as jest.Mock).mockResolvedValueOnce({ name: 'biblical-region-base' });
    renderHook(() => useMapTileCache('https://example/ancient.json'));
    await waitFor(() => expect(OfflineManager.getPack).toHaveBeenCalled());
    expect(OfflineManager.createPack).not.toHaveBeenCalled();
  });

  it('swallows offline manager errors so the map still renders', async () => {
    (OfflineManager.setMaximumAmbientCacheSize as jest.Mock).mockRejectedValueOnce(
      new Error('boom'),
    );
    (OfflineManager.createPack as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useMapTileCache('https://example/ancient.json'));
    expect(result.current).toBeUndefined();
  });
});
