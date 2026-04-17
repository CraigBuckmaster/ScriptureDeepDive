import { describe, it, expect } from 'vitest';
import {
  LIMITS,
  burstBucket,
  checkAndIncrement,
  monthBucket,
} from '../src/rateLimit';
import type { AuthContext, Env } from '../src/types';

const FAKE_KV = (): KVNamespace => {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list() {
      return { keys: [], list_complete: true, cursor: '' };
    },
  } as unknown as KVNamespace;
};

function env(): Env {
  return { VERSION: 'test', RATE_LIMITS: FAKE_KV() };
}

function ctx(entitlement: 'premium' | 'partner_plus' = 'premium'): AuthContext {
  return { receiptHash: 'a'.repeat(64), entitlement };
}

describe('bucket helpers', () => {
  it('month bucket uses UTC year-month', () => {
    const d = new Date(Date.UTC(2026, 3, 17, 12));
    expect(monthBucket(d)).toBe('2026-04');
  });

  it('burst bucket increments every 10 minutes', () => {
    const a = new Date(Date.UTC(2026, 3, 17, 12, 0, 0));
    const b = new Date(Date.UTC(2026, 3, 17, 12, 9, 59));
    const c = new Date(Date.UTC(2026, 3, 17, 12, 10, 0));
    expect(burstBucket(a)).toBe(burstBucket(b));
    expect(burstBucket(a)).not.toBe(burstBucket(c));
  });
});

describe('checkAndIncrement', () => {
  it('allows the first call and decrements remaining', async () => {
    const r = await checkAndIncrement(ctx('premium'), env());
    expect(r.allowed).toBe(true);
    expect(r.monthlyRemaining).toBe(LIMITS.premium.monthly - 1);
    expect(r.burstRemaining).toBe(LIMITS.premium.burst - 1);
  });

  it('blocks after 10 burst calls within the window', async () => {
    const e = env();
    const c = ctx('premium');
    const now = new Date(Date.UTC(2026, 3, 17, 12, 0, 0));
    for (let i = 0; i < LIMITS.premium.burst; i++) {
      const r = await checkAndIncrement(c, e, { now });
      expect(r.allowed).toBe(true);
    }
    const blocked = await checkAndIncrement(c, e, { now });
    expect(blocked.allowed).toBe(false);
    expect(blocked.burstRemaining).toBe(0);
  });

  it('blocks monthly limit for premium', async () => {
    const e = env();
    const c = ctx('premium');
    const now = new Date(Date.UTC(2026, 3, 17, 12, 0, 0));
    // Pre-seed the monthly counter so we don't have to make 300 calls
    await e.RATE_LIMITS.put(
      `rate:${c.receiptHash}:${monthBucket(now)}`,
      String(LIMITS.premium.monthly),
    );
    const r = await checkAndIncrement(c, e, { now });
    expect(r.allowed).toBe(false);
    expect(r.monthlyRemaining).toBe(0);
  });

  it('gives partner_plus larger limits than premium', async () => {
    expect(LIMITS.partner_plus.monthly).toBeGreaterThan(LIMITS.premium.monthly);
    expect(LIMITS.partner_plus.burst).toBeGreaterThan(LIMITS.premium.burst);
  });

  it('counts are per-user, not shared across receipts', async () => {
    const e = env();
    const a = { receiptHash: 'a'.repeat(64), entitlement: 'premium' } as const;
    const b = { receiptHash: 'b'.repeat(64), entitlement: 'premium' } as const;
    const now = new Date();
    for (let i = 0; i < LIMITS.premium.burst; i++) {
      await checkAndIncrement(a, e, { now });
    }
    const r = await checkAndIncrement(b, e, { now });
    expect(r.allowed).toBe(true);
  });
});
