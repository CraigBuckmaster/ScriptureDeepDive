/**
 * Tests for services/connectivity.ts
 *
 * Uses jest.resetModules() + require() to get fresh module state
 * for each test, since the module has internal mutable state.
 */

const mockFlushQueue = jest.fn().mockResolvedValue(0);
const mockGetPendingCount = jest.fn().mockResolvedValue(0);

jest.mock('@/services/syncQueue', () => ({
  flushQueue: (...args: any[]) => mockFlushQueue(...args),
  getPendingCount: (...args: any[]) => mockGetPendingCount(...args),
}));

// NetInfo is not installed — the source's try/catch require() naturally
// falls back to polling, so no mock is needed here.

type ConnectivityModule = typeof import('@/services/connectivity');

function loadModule(): ConnectivityModule {
  return require('@/services/connectivity');
}

describe('connectivity service', () => {
  let mod: ConnectivityModule;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.mock('@/services/syncQueue', () => ({
      flushQueue: mockFlushQueue,
      getPendingCount: mockGetPendingCount,
    }));
    mockFlushQueue.mockResolvedValue(0);
    mod = loadModule();
  });

  afterEach(() => {
    mod.stopMonitoring();
  });

  it('isConnected returns true initially', () => {
    expect(mod.isConnected()).toBe(true);
  });

  it('onConnectivityChange returns an unsubscribe function', () => {
    const unsub = mod.onConnectivityChange(jest.fn());
    expect(typeof unsub).toBe('function');
  });

  it('startMonitoring is idempotent', () => {
    global.fetch = jest.fn().mockResolvedValue({}) as any;
    mod.startMonitoring();
    mod.startMonitoring();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('stopMonitoring prevents further polling', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({}) as any;
    mod.startMonitoring();
    mod.stopMonitoring();
    const calls = (global.fetch as jest.Mock).mock.calls.length;
    jest.advanceTimersByTime(60_000);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(calls);
    jest.useRealTimers();
  });

  it('single fetch failure does NOT mark offline', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('err'))
      .mockResolvedValue({}) as any;

    mod.startMonitoring();
    await jest.advanceTimersByTimeAsync(100);

    expect(mod.isConnected()).toBe(true);
    jest.useRealTimers();
  });

  it('two consecutive failures marks offline', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('err'))
      .mockRejectedValueOnce(new Error('err'))
      .mockResolvedValue({}) as any;

    mod.startMonitoring();
    await jest.advanceTimersByTimeAsync(100);
    expect(mod.isConnected()).toBe(true);

    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);
    expect(mod.isConnected()).toBe(false);
    jest.useRealTimers();
  });

  it('notifies listeners on state change', async () => {
    jest.useFakeTimers();
    const listener = jest.fn();
    mod.onConnectivityChange(listener);

    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('err'))
      .mockRejectedValueOnce(new Error('err')) as any;

    mod.startMonitoring();
    await jest.advanceTimersByTimeAsync(100);
    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);

    expect(listener).toHaveBeenCalledWith(false);
    jest.useRealTimers();
  });

  it('unsubscribed listener is not called', async () => {
    jest.useFakeTimers();
    const listener = jest.fn();
    const unsub = mod.onConnectivityChange(listener);
    unsub();

    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('err'))
      .mockRejectedValueOnce(new Error('err')) as any;

    mod.startMonitoring();
    await jest.advanceTimersByTimeAsync(100);
    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);

    expect(listener).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('does not notify when state stays the same', async () => {
    jest.useFakeTimers();
    const listener = jest.fn();
    mod.onConnectivityChange(listener);

    global.fetch = jest.fn().mockResolvedValue({}) as any;
    mod.startMonitoring();
    await jest.advanceTimersByTimeAsync(100);
    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);

    expect(listener).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('triggers flushQueue when coming back online', async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({}) as any;

    mod.startMonitoring();

    await jest.advanceTimersByTimeAsync(100);
    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);
    expect(mod.isConnected()).toBe(false);

    await jest.advanceTimersByTimeAsync(15_000);
    await jest.advanceTimersByTimeAsync(100);

    expect(mod.isConnected()).toBe(true);
    expect(mockFlushQueue).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
