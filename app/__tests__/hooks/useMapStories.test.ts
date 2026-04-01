import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getMapStories: jest.fn().mockResolvedValue([
    { id: 'exodus', title: 'The Exodus', era: 'exodus' },
    { id: 'conquest', title: 'The Conquest', era: 'conquest' },
  ]),
}));

import { useMapStories } from '@/hooks/useMapStories';
const { getMapStories } = require('@/db/content');

describe('useMapStories', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { result } = renderHook(() => useMapStories());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stories).toEqual([]);
  });

  it('loads all stories when no era filter', async () => {
    const { result } = renderHook(() => useMapStories());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.stories).toHaveLength(2);
    expect(getMapStories).toHaveBeenCalledWith(undefined);
  });

  it('passes era filter to query', async () => {
    const { result } = renderHook(() => useMapStories('exodus'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getMapStories).toHaveBeenCalledWith('exodus');
  });

  it('reloads when era changes', async () => {
    const { result, rerender } = renderHook(
      ({ era }) => useMapStories(era),
      { initialProps: { era: 'exodus' } },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    rerender({ era: 'conquest' });
    expect(getMapStories).toHaveBeenCalledWith('conquest');
  });
});
