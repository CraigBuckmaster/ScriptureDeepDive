import { describe, expect, it } from 'vitest';
import {
  dayBucket,
  fingerprintForDay,
  hourBucket,
  recordClientMetrics,
  recordDailyUser,
  recordHourlyMetric,
  validateClientMetricsPayload,
} from '../src/metrics';
import type { Env } from '../src/types';

function makeD1() {
  const calls: Array<{ sql: string; binds: unknown[] }> = [];
  const stmt = (sql: string) => ({
    bind: (...binds: unknown[]) => ({
      run: async () => {
        calls.push({ sql, binds });
        return { meta: { changes: 1 } };
      },
    }),
  });
  const env = {
    VERSION: '1',
    RATE_LIMITS: {} as Env['RATE_LIMITS'],
    CORPUS_GAPS: {
      prepare: (sql: string) => stmt(sql),
    } as unknown as Env['CORPUS_GAPS'],
  } as Env;
  return { calls, env };
}

describe('bucket helpers', () => {
  it('hourBucket formats UTC to YYYY-MM-DDTHH', () => {
    expect(hourBucket(new Date('2026-06-01T12:34:56Z'))).toBe('2026-06-01T12');
  });
  it('dayBucket strips the hour segment', () => {
    expect(dayBucket(new Date('2026-06-01T12:34:56Z'))).toBe('2026-06-01');
  });
});

describe('fingerprintForDay', () => {
  it('returns a 16-char hex string', async () => {
    const fp = await fingerprintForDay('hash-x', '2026-06-01');
    expect(fp).toMatch(/^[0-9a-f]{16}$/);
  });
  it('is deterministic for a given (hash, date) pair', async () => {
    const a = await fingerprintForDay('hash-x', '2026-06-01');
    const b = await fingerprintForDay('hash-x', '2026-06-01');
    expect(a).toBe(b);
  });
  it('differs across dates (nightly rotation)', async () => {
    const a = await fingerprintForDay('hash-x', '2026-06-01');
    const b = await fingerprintForDay('hash-x', '2026-06-02');
    expect(a).not.toBe(b);
  });
  it('differs across users for the same date', async () => {
    const a = await fingerprintForDay('hash-x', '2026-06-01');
    const b = await fingerprintForDay('hash-y', '2026-06-01');
    expect(a).not.toBe(b);
  });
});

describe('recordHourlyMetric', () => {
  it('is a no-op when CORPUS_GAPS is not bound', async () => {
    const env = { VERSION: '1', RATE_LIMITS: {} as Env['RATE_LIMITS'] } as Env;
    await expect(
      recordHourlyMetric({ env, bucket: 'success_count' }),
    ).resolves.toBeUndefined();
  });

  it('writes an upsert row with the correct bucket column flipped on', async () => {
    const { calls, env } = makeD1();
    await recordHourlyMetric({
      env,
      bucket: 'haiku_count',
      latencyMs: 1200,
      now: () => new Date('2026-06-01T12:34:56Z'),
    });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.sql).toContain('amicus_hourly_metrics');
    expect(calls[0]!.binds[0]).toBe('2026-06-01T12');
    // haiku_count is column #6 in the bound positional list (after the
    // bucket + 5 sibling counters).
    const binds = calls[0]!.binds;
    expect(binds[1]).toBe(0); // total_requests
    expect(binds[5]).toBe(1); // haiku_count
    expect(binds[6]).toBe(0); // sonnet_count
    expect(binds[8]).toBe(1200); // latency_sum_ms
    expect(binds[9]).toBe(1); // latency_count
  });
});

describe('recordDailyUser', () => {
  it('records a new fingerprint and bumps dau_premium', async () => {
    const { calls, env } = makeD1();
    await recordDailyUser({
      env,
      receiptHash: 'hash-x',
      tier: 'premium',
      now: () => new Date('2026-06-01T12:34:56Z'),
    });
    const sqls = calls.map((c) => c.sql);
    expect(sqls.some((s) => s.includes('amicus_daily_user_fingerprints'))).toBe(true);
    expect(
      sqls.some((s) => s.includes('dau_premium = dau_premium + 1')),
    ).toBe(true);
  });

  it('does not persist the raw receipt hash', async () => {
    const { calls, env } = makeD1();
    await recordDailyUser({
      env,
      receiptHash: 'super-secret-hash',
      tier: 'premium',
    });
    for (const call of calls) {
      for (const b of call.binds) {
        if (typeof b === 'string') {
          expect(b).not.toContain('super-secret-hash');
        }
      }
    }
  });
});

describe('validateClientMetricsPayload', () => {
  it('accepts a well-formed payload', () => {
    const payload = validateClientMetricsPayload({
      events: [
        { name: 'peek_opened', count: 3 },
        { name: 'mini_conversation_turns', count: 1, tag: '2-turn' },
      ],
    });
    expect(payload?.events).toHaveLength(2);
    expect(payload?.events[1]!.tag).toBe('2-turn');
  });

  it('rejects unknown event names', () => {
    expect(
      validateClientMetricsPayload({
        events: [{ name: 'steal_data', count: 1 }],
      }),
    ).toBeNull();
  });

  it('rejects absurd counts and non-numeric counts', () => {
    expect(
      validateClientMetricsPayload({
        events: [{ name: 'peek_opened', count: 100_000 }],
      }),
    ).toBeNull();
    expect(
      validateClientMetricsPayload({
        events: [{ name: 'peek_opened', count: -1 }],
      }),
    ).toBeNull();
    expect(
      validateClientMetricsPayload({
        events: [{ name: 'peek_opened', count: 'lots' }],
      }),
    ).toBeNull();
  });

  it('drops overly long tags', () => {
    const payload = validateClientMetricsPayload({
      events: [{ name: 'peek_opened', count: 1, tag: 'x'.repeat(80) }],
    });
    expect(payload?.events[0]!.tag).toBeUndefined();
  });

  it('rejects malformed top-level inputs', () => {
    expect(validateClientMetricsPayload(null)).toBeNull();
    expect(validateClientMetricsPayload({ events: 'x' })).toBeNull();
    expect(validateClientMetricsPayload({})).toBeNull();
  });
});

describe('recordClientMetrics', () => {
  it('writes one upsert per event', async () => {
    const { calls, env } = makeD1();
    await recordClientMetrics(
      env,
      {
        events: [
          { name: 'peek_opened', count: 2 },
          { name: 'home_card_tapped', count: 1, tag: 'prompt' },
        ],
      },
      () => new Date('2026-06-01T12:00:00Z'),
    );
    expect(calls).toHaveLength(2);
    expect(calls[0]!.binds[0]).toBe('2026-06-01T12');
    expect(calls[0]!.binds[1]).toBe('peek_opened');
    expect(calls[1]!.binds[2]).toBe('prompt');
  });
});
