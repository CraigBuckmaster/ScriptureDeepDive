import { createSecureStorage } from '@/lib/secureStorage';

// In-memory mock of expo-secure-store. The `mock` prefix is required for
// variables referenced inside a jest.mock factory.
const mockMem = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => (mockMem.has(k) ? mockMem.get(k)! : null)),
  setItemAsync: jest.fn(async (k: string, v: string) => { mockMem.set(k, v); }),
  deleteItemAsync: jest.fn(async (k: string) => { mockMem.delete(k); }),
}));

describe('secureStorage (chunked SecureStore adapter)', () => {
  beforeEach(() => mockMem.clear());

  it('round-trips a short value', async () => {
    const store = createSecureStorage();
    await store.setItem('sb-auth', 'hello');
    expect(await store.getItem('sb-auth')).toBe('hello');
  });

  it('round-trips a value larger than the chunk size', async () => {
    const store = createSecureStorage();
    const big = 'x'.repeat(5000); // > CHUNK_SIZE (1800)
    await store.setItem('sb-auth', big);
    expect(await store.getItem('sb-auth')).toBe(big);
    // Stored as multiple chunks, not a single oversized value.
    expect(mockMem.get('sb-auth')).toBe('3');
    expect(mockMem.has('sb-auth.0')).toBe(true);
    expect(mockMem.has('sb-auth.2')).toBe(true);
  });

  it('returns null for a missing key', async () => {
    const store = createSecureStorage();
    expect(await store.getItem('nope')).toBeNull();
  });

  it('removeItem deletes all chunks', async () => {
    const store = createSecureStorage();
    await store.setItem('sb-auth', 'y'.repeat(4000));
    await store.removeItem('sb-auth');
    expect(await store.getItem('sb-auth')).toBeNull();
    expect([...mockMem.keys()]).toHaveLength(0);
  });

  it('overwriting a long value with a short one leaves no stale chunks', async () => {
    const store = createSecureStorage();
    await store.setItem('sb-auth', 'z'.repeat(4000)); // 3 chunks
    await store.setItem('sb-auth', 'short'); // 1 chunk
    expect(await store.getItem('sb-auth')).toBe('short');
    expect(mockMem.has('sb-auth.1')).toBe(false);
    expect(mockMem.has('sb-auth.2')).toBe(false);
  });
});
