import { renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getAllPeople: jest.fn().mockResolvedValue([
    { id: 'abraham', name: 'Abraham', era: 'patriarch' },
    { id: 'moses', name: 'Moses', era: 'exodus' },
  ]),
}));

jest.mock('@/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { usePeople } from '@/hooks/usePeople';
const { getAllPeople } = require('@/db/content');
const { logger } = require('@/utils/logger');

describe('usePeople', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts in loading state', () => {
    const { result } = renderHook(() => usePeople());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.people).toEqual([]);
  });

  it('loads all people from DB', async () => {
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.people).toHaveLength(2);
    expect(result.current.people[0].name).toBe('Abraham');
  });

  it('logs loaded count', async () => {
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(logger.info).toHaveBeenCalledWith('usePeople', expect.stringContaining('2'));
  });

  it('handles errors gracefully', async () => {
    getAllPeople.mockRejectedValueOnce(new Error('DB error'));
    const { result } = renderHook(() => usePeople());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.people).toEqual([]);
    expect(logger.error).toHaveBeenCalled();
  });
});
