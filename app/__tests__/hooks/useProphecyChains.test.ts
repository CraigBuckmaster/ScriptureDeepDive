import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getAllProphecyChains: jest.fn().mockResolvedValue([
    { id: 'seed', title: 'Seed of the Woman', category: 'messianic' },
    { id: 'temple', title: 'Temple and Presence', category: 'typological' },
  ]),
  getProphecyChain: jest.fn().mockResolvedValue(
    { id: 'seed', title: 'Seed of the Woman', category: 'messianic' },
  ),
}));

import { useProphecyChains, useProphecyChainDetail } from '@/hooks/useProphecyChains';
const { getAllProphecyChains, getProphecyChain } = require('@/db/content');

describe('useProphecyChains', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { result } = renderHook(() => useProphecyChains());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.chains).toEqual([]);
  });

  it('loads all prophecy chains', async () => {
    const { result } = renderHook(() => useProphecyChains());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chains).toHaveLength(2);
    expect(result.current.chains[0].title).toBe('Seed of the Woman');
  });

  it('calls getAllProphecyChains on mount', async () => {
    const { result } = renderHook(() => useProphecyChains());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getAllProphecyChains).toHaveBeenCalledTimes(1);
  });
});

describe('useProphecyChainDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads a single chain by ID', async () => {
    const { result } = renderHook(() => useProphecyChainDetail('seed'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.chain).toBeTruthy();
    expect(getProphecyChain).toHaveBeenCalledWith('seed');
  });

  it('does not fetch with empty chainId', () => {
    renderHook(() => useProphecyChainDetail(''));
    expect(getProphecyChain).not.toHaveBeenCalled();
  });
});
