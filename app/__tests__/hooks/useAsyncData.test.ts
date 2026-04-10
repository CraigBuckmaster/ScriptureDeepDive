/**
 * Hook tests for useAsyncData — generic async data fetching hook.
 */
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAsyncData } from '@/hooks/useAsyncData';

describe('useAsyncData', () => {
  it('starts in loading state with initial value', () => {
    const fetchFn = jest.fn(() => new Promise<string[]>(() => {})); // never resolves
    const { result } = renderHook(() => useAsyncData(fetchFn, [], []));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('resolves to fetched data', async () => {
    const fetchFn = jest.fn(() => Promise.resolve(['a', 'b']));
    const { result } = renderHook(() => useAsyncData(fetchFn, [], []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['a', 'b']);
    expect(result.current.error).toBeNull();
  });

  it('sets error on rejection', async () => {
    const fetchFn = jest.fn(() => Promise.reject(new Error('fail')));
    const { result } = renderHook(() => useAsyncData(fetchFn, [], []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe('fail');
  });

  it('wraps non-Error rejections in Error', async () => {
    const fetchFn = jest.fn(() => Promise.reject('string error'));
    const { result } = renderHook(() => useAsyncData(fetchFn, [], []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe('string error');
  });

  it('provides a reload function that refetches', async () => {
    let callCount = 0;
    const fetchFn = jest.fn(() => Promise.resolve([++callCount]));
    const { result } = renderHook(() => useAsyncData(fetchFn, [], [] as number[]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([1]);

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchFn.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('returns typeof reload as function', async () => {
    const fetchFn = jest.fn(() => Promise.resolve(42));
    const { result } = renderHook(() => useAsyncData(fetchFn, [], 0));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.reload).toBe('function');
  });
});
