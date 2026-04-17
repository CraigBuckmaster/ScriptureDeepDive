import { describe, it, expect } from 'vitest';
import {
  authenticate,
  extractBearerToken,
  pickActiveEntitlement,
  hashReceipt,
} from '../src/auth';
import type { Env } from '../src/types';

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

function fakeEnv(): Env {
  return {
    VERSION: '0.0.0-test',
    RATE_LIMITS: FAKE_KV(),
    REVENUECAT_SECRET_KEY: 'sk_test_revenuecat',
  };
}

describe('extractBearerToken', () => {
  it('returns the token after Bearer', () => {
    expect(extractBearerToken('Bearer abc123xyz')).toBe('abc123xyz');
  });
  it('is case-insensitive on the scheme', () => {
    expect(extractBearerToken('bearer xyz')).toBe('xyz');
  });
  it('returns null for missing header', () => {
    expect(extractBearerToken(null)).toBeNull();
  });
  it('returns null for unexpected schemes', () => {
    expect(extractBearerToken('Basic abc')).toBeNull();
  });
});

describe('hashReceipt', () => {
  it('produces a deterministic hex digest', async () => {
    const a = await hashReceipt('receipt-1234567890abcdef');
    const b = await hashReceipt('receipt-1234567890abcdef');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs for different inputs', async () => {
    const a = await hashReceipt('a'.repeat(32));
    const b = await hashReceipt('b'.repeat(32));
    expect(a).not.toBe(b);
  });
});

describe('pickActiveEntitlement', () => {
  it('prefers partner_plus over premium when both active', () => {
    const body = {
      subscriber: {
        entitlements: {
          premium: { expires_date: null },
          partner_plus: { expires_date: null },
        },
      },
    };
    expect(pickActiveEntitlement(body)).toBe('partner_plus');
  });

  it('skips expired entitlements', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(
      pickActiveEntitlement({
        subscriber: { entitlements: { premium: { expires_date: yesterday } } },
      }),
    ).toBeNull();
  });

  it('returns null when no entitlements', () => {
    expect(pickActiveEntitlement({ subscriber: { entitlements: {} } })).toBeNull();
    expect(pickActiveEntitlement({})).toBeNull();
  });
});

describe('authenticate', () => {
  it('rejects missing Authorization header', async () => {
    const r = await authenticate(null, fakeEnv());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.kind).toBe('missing_token');
  });

  it('rejects short / malformed tokens without hitting RevenueCat', async () => {
    const calls: string[] = [];
    const fakeFetch = (async (u: string) => {
      calls.push(u);
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    const r = await authenticate('Bearer short', fakeEnv(), fakeFetch);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.kind).toBe('malformed_token');
    expect(calls).toHaveLength(0);
  });

  it('treats RevenueCat 401 as malformed_token', async () => {
    const fakeFetch = (async () =>
      new Response('unauthorized', { status: 401 })) as typeof fetch;
    const r = await authenticate(
      'Bearer ' + 'x'.repeat(40),
      fakeEnv(),
      fakeFetch,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.kind).toBe('malformed_token');
  });

  it('returns premium entitlement for a valid receipt', async () => {
    const fakeFetch = (async () =>
      new Response(
        JSON.stringify({
          subscriber: { entitlements: { premium: { expires_date: null } } },
        }),
        { status: 200 },
      )) as typeof fetch;
    const r = await authenticate(
      'Bearer ' + 'x'.repeat(40),
      fakeEnv(),
      fakeFetch,
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.context.entitlement).toBe('premium');
  });

  it('caches auth results in KV for the 5-min window', async () => {
    const env = fakeEnv();
    let hits = 0;
    const fakeFetch = (async () => {
      hits++;
      return new Response(
        JSON.stringify({
          subscriber: { entitlements: { partner_plus: { expires_date: null } } },
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    const token = 'Bearer ' + 'x'.repeat(40);
    const first = await authenticate(token, env, fakeFetch);
    const second = await authenticate(token, env, fakeFetch);
    expect(first.ok && second.ok).toBe(true);
    expect(hits).toBe(1);
  });
});
