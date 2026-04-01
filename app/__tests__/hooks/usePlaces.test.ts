import { renderHook, waitFor } from '@testing-library/react-native';

const mockGetPlaces = jest.fn();

jest.mock('@/db/content', () => ({
  getPlaces: (...args: any[]) => mockGetPlaces(...args),
}));

import { usePlaces } from '@/hooks/usePlaces';

describe('usePlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns places list after loading', async () => {
    const mockData = [
      { id: 'jerusalem', name: 'Jerusalem', lat: 31.7683, lng: 35.2137 },
      { id: 'bethlehem', name: 'Bethlehem', lat: 31.7054, lng: 35.2024 },
    ];
    mockGetPlaces.mockResolvedValue(mockData);

    const { result } = renderHook(() => usePlaces());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.places).toEqual(mockData);
  });

  it('starts in loading state', () => {
    mockGetPlaces.mockResolvedValue([]);
    const { result } = renderHook(() => usePlaces());
    expect(result.current.isLoading).toBe(true);
  });

  it('sets isLoading to false with empty data', async () => {
    mockGetPlaces.mockResolvedValue([]);
    const { result } = renderHook(() => usePlaces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.places).toEqual([]);
  });
});
