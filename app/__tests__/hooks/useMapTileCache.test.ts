import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@maplibre/maplibre-react-native', () => ({
  OfflineManager: {
    createPack: jest.fn().mockResolvedValue(undefined),
    getPacks: jest.fn().mockResolvedValue([]),
    setMaximumAmbientCacheSize: jest.fn().mockResolvedValue(undefined),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { OfflineManager } = require('@maplibre/maplibre-react-native');
import { useMapTileCache } from '@/hooks/useMapTileCache';

beforeEach(() => {
  (OfflineManager.createPack as jest.Mock).mockClear().mockResolvedValue(undefined);
  (OfflineManager.getPacks as jest.Mock).mockClear().mockResolvedValue([]);
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
      mapStyle: 'https://example/ancient.json',
      minZoom: 0,
      maxZoom: 7,
      metadata: { name: 'biblical-region-base' },
    });
    // bounds: [west, south, east, north] (flat LngLatBounds in v11)
    expect(call.bounds).toEqual([25, 20, 55, 45]);
  });

  it('skips pack creation when the pack is already present (tagged via metadata.name)', async () => {
    (OfflineManager.getPacks as jest.Mock).mockResolvedValueOnce([
      { id: 'uuid-abc', metadata: { name: 'biblical-region-base' } },
    ]);
    renderHook(() => useMapTileCache('https://example/ancient.json'));
    await waitFor(() => expect(OfflineManager.getPacks).toHaveBeenCalled());
    expect(OfflineManager.createPack).not.toHaveBeenCalled();
  });

  it('creates a pack when existing packs are unrelated', async () => {
    (OfflineManager.getPacks as jest.Mock).mockResolvedValueOnce([
      { id: 'uuid-xyz', metadata: { name: 'some-other-region' } },
    ]);
    renderHook(() => useMapTileCache('https://example/ancient.json'));
    await waitFor(() => expect(OfflineManager.createPack).toHaveBeenCalled());
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
