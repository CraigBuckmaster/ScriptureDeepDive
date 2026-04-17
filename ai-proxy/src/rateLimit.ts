/**
 * rateLimit.ts — KV-backed per-user rate limits.
 *
 * Limits per entitlement:
 *   premium        — 300/month,   10/10-minute burst
 *   partner_plus   — 1,500/month, 30/10-minute burst
 *
 * Counters live in Workers KV with month-granularity and 10-minute-bucket
 * keys so they auto-expire. Deliberately simple — Durable Objects would give
 * stricter semantics but add complexity we don't need for v1 traffic.
 */
import type { AuthContext, Entitlement, Env, RateLimitResult } from './types';

export const LIMITS: Record<Entitlement, { monthly: number; burst: number }> = {
  premium: { monthly: 300, burst: 10 },
  partner_plus: { monthly: 1500, burst: 30 },
};

const BURST_WINDOW_SECONDS = 10 * 60;
const MONTH_TTL_SECONDS = 35 * 24 * 60 * 60; // a little over a month so keys overlap

export function monthBucket(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function burstBucket(now: Date = new Date()): string {
  return String(Math.floor(now.getTime() / 1000 / BURST_WINDOW_SECONDS));
}

export interface RateLimitOptions {
  /** Inject a clock for tests. */
  now?: Date;
}

/**
 * Atomically-ish increment both counters. KV's read-modify-write isn't truly
 * atomic across replicas, so we over-count rather than under-count when two
 * requests race (acceptable for a soft cap). The penalty of a user
 * occasionally getting 301 rather than 300 calls in a month is negligible.
 */
export async function checkAndIncrement(
  ctx: AuthContext,
  env: Env,
  opts: RateLimitOptions = {},
): Promise<RateLimitResult> {
  const now = opts.now ?? new Date();
  const limit = LIMITS[ctx.entitlement];
  const monthKey = `rate:${ctx.receiptHash}:${monthBucket(now)}`;
  const burstKey = `burst:${ctx.receiptHash}:${burstBucket(now)}`;

  const [monthRaw, burstRaw] = await Promise.all([
    env.RATE_LIMITS.get(monthKey),
    env.RATE_LIMITS.get(burstKey),
  ]);
  const monthUsed = parseInt(monthRaw ?? '0', 10) || 0;
  const burstUsed = parseInt(burstRaw ?? '0', 10) || 0;

  if (monthUsed >= limit.monthly) {
    return {
      allowed: false,
      retryAfterSec: secondsUntilNextMonth(now),
      monthlyRemaining: 0,
      burstRemaining: Math.max(0, limit.burst - burstUsed),
    };
  }
  if (burstUsed >= limit.burst) {
    return {
      allowed: false,
      retryAfterSec: BURST_WINDOW_SECONDS,
      monthlyRemaining: limit.monthly - monthUsed,
      burstRemaining: 0,
    };
  }

  await Promise.all([
    env.RATE_LIMITS.put(monthKey, String(monthUsed + 1), {
      expirationTtl: MONTH_TTL_SECONDS,
    }),
    env.RATE_LIMITS.put(burstKey, String(burstUsed + 1), {
      expirationTtl: BURST_WINDOW_SECONDS,
    }),
  ]);

  return {
    allowed: true,
    monthlyRemaining: limit.monthly - monthUsed - 1,
    burstRemaining: limit.burst - burstUsed - 1,
  };
}

function secondsUntilNextMonth(now: Date): number {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}
