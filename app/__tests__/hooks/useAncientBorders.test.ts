import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getAncientBorders: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAncientBorders } = require('@/db/content');
import { useAncientBorders } from '@/hooks/useAncientBorders';

beforeEach(() => {
  (getAncientBorders as jest.Mock).mockClear();
});

describe('useAncientBorders', () => {
  it('returns an empty FeatureCollection and skips the query when era is "all"', async () => {
    const { result } = renderHook(() => useAncientBorders('all'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.borders).toEqual({ type: 'FeatureCollection', features: [] });
    expect(getAncientBorders).not.toHaveBeenCalled();
  });

  it('returns an empty FeatureCollection and skips the query when era is null', async () => {
    const { result } = renderHook(() => useAncientBorders(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.borders).toEqual({ type: 'FeatureCollection', features: [] });
    expect(getAncientBorders).not.toHaveBeenCalled();
  });

  it('queries getAncientBorders for a specific era and returns the data', async () => {
    const fc = {
      type: 'FeatureCollection' as const,
      features: [
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0]]] }, properties: {} },
      ],
    };
    (getAncientBorders as jest.Mock).mockResolvedValue(fc);

    const { result } = renderHook(() => useAncientBorders('nt'));
    await waitFor(() => expect(result.current.borders.features.length).toBe(1));
    expect(getAncientBorders).toHaveBeenCalledWith('nt');
    expect(result.current.borders).toEqual(fc);
  });
});
