/**
 * metrics.ts — Privacy-safe aggregate metrics for Amicus (#1469).
 *
 * Two writers:
 *   - `recordHourlyMetric` writes a small counter row per request-lifecycle
 *     event (success, rate_limit, auth_fail, gap_signal, …) keyed by the
 *     UTC hour bucket. No per-user state is ever persisted.
 *   - `recordDailyUser` records a SHA-256 *fingerprint* of the receipt hash
 *     for the current UTC date. The fingerprint is rotated nightly (so
 *     cross-day correlation is impossible even server-side) and the raw
 *     token never touches D1.
 *
 * The D1 schema lives in `_tools/amicus_analytics/README.md`. Both tables
 * are optional — if the `CORPUS_GAPS` binding is missing the functions are
 * no-ops so metric writes can't break the request path.
 */
import type { Env } from './types';

export type HourlyBucket =
  | 'total_requests'
  | 'success_count'
  | 'rate_limit_count'
  | 'auth_fail_count'
  | 'haiku_count'
  | 'sonnet_count'
  | 'gap_signal_count';

export interface RecordHourlyArgs {
  env: Env;
  bucket: HourlyBucket;
  /** Optional observation — currently only latency_ms is aggregated. */
  latencyMs?: number | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  /** Override clock for tests. */
  now?: () => Date;
}

export function hourBucket(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}`;
}

export function dayBucket(now: Date): string {
  return hourBucket(now).slice(0, 10);
}

const COUNTER_COLUMN: Record<HourlyBucket, string> = {
  total_requests: 'total_requests',
  success_count: 'success_count',
  rate_limit_count: 'rate_limit_count',
  auth_fail_count: 'auth_fail_count',
  haiku_count: 'haiku_count',
  sonnet_count: 'sonnet_count',
  gap_signal_count: 'gap_signal_count',
};

/**
 * Upsert-increment the hourly counter + update rolling latency/token
 * averages. The SQL is written as a single idempotent statement so
 * concurrent writes in the same hour coalesce at the DB level.
 */
export async function recordHourlyMetric(
  args: RecordHourlyArgs,
): Promise<void> {
  if (!args.env.CORPUS_GAPS) return;
  const col = COUNTER_COLUMN[args.bucket];
  const now = (args.now ?? (() => new Date()))();
  const bucket = hourBucket(now);
  const latency = args.latencyMs ?? null;
  const inputTokens = args.inputTokens ?? null;
  const outputTokens = args.outputTokens ?? null;

  try {
    await args.env.CORPUS_GAPS.prepare(
      `INSERT INTO amicus_hourly_metrics (
         hour_bucket, total_requests, success_count, rate_limit_count,
         auth_fail_count, haiku_count, sonnet_count, gap_signal_count,
         latency_sum_ms, latency_count,
         input_tokens_sum, input_tokens_count,
         output_tokens_sum, output_tokens_count
       ) VALUES (
         ?,
         ?, ?, ?, ?, ?, ?, ?,
         ?, ?,
         ?, ?,
         ?, ?
       )
       ON CONFLICT(hour_bucket) DO UPDATE SET
         ${col} = ${col} + excluded.${col},
         latency_sum_ms = latency_sum_ms + excluded.latency_sum_ms,
         latency_count = latency_count + excluded.latency_count,
         input_tokens_sum = input_tokens_sum + excluded.input_tokens_sum,
         input_tokens_count = input_tokens_count + excluded.input_tokens_count,
         output_tokens_sum = output_tokens_sum + excluded.output_tokens_sum,
         output_tokens_count = output_tokens_count + excluded.output_tokens_count`,
    )
      .bind(
        bucket,
        args.bucket === 'total_requests' ? 1 : 0,
        args.bucket === 'success_count' ? 1 : 0,
        args.bucket === 'rate_limit_count' ? 1 : 0,
        args.bucket === 'auth_fail_count' ? 1 : 0,
        args.bucket === 'haiku_count' ? 1 : 0,
        args.bucket === 'sonnet_count' ? 1 : 0,
        args.bucket === 'gap_signal_count' ? 1 : 0,
        latency ?? 0,
        latency !== null ? 1 : 0,
        inputTokens ?? 0,
        inputTokens !== null ? 1 : 0,
        outputTokens ?? 0,
        outputTokens !== null ? 1 : 0,
      )
      .run();
  } catch (err) {
    // Metrics must not break the request — swallow + log only.
    console.log(
      JSON.stringify({
        type: 'metric_write_error',
        bucket: args.bucket,
        detail: (err as Error).message,
      }),
    );
  }
}

export type Tier = 'premium' | 'partner_plus';

export interface RecordDailyUserArgs {
  env: Env;
  /** Already hashed receipt — the proxy stores this, not the raw token. */
  receiptHash: string;
  tier: Tier;
  now?: () => Date;
}

/**
 * Increment the daily unique-user counter IFF we haven't already recorded
 * this fingerprint on this date. Uses a fingerprint table so we never
 * persist the raw receipt hash across days.
 */
export async function recordDailyUser(
  args: RecordDailyUserArgs,
): Promise<void> {
  if (!args.env.CORPUS_GAPS) return;
  const now = (args.now ?? (() => new Date()))();
  const date = dayBucket(now);
  const fingerprint = await fingerprintForDay(args.receiptHash, date);

  try {
    const fp = await args.env.CORPUS_GAPS.prepare(
      `INSERT OR IGNORE INTO amicus_daily_user_fingerprints (date, fingerprint, tier)
       VALUES (?, ?, ?)`,
    )
      .bind(date, fingerprint, args.tier)
      .run();
    // D1's `meta.changes` tells us whether the INSERT actually added a
    // row. If it did, we have a new unique user for the day — bump the
    // per-tier DAU counter.
    const changes = (fp as unknown as { meta?: { changes?: number } }).meta
      ?.changes ?? 0;
    if (changes > 0) {
      const col = args.tier === 'partner_plus' ? 'dau_partner_plus' : 'dau_premium';
      await args.env.CORPUS_GAPS.prepare(
        `INSERT INTO amicus_daily_users (date, dau_premium, dau_partner_plus)
         VALUES (?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET ${col} = ${col} + 1`,
      )
        .bind(
          date,
          args.tier === 'premium' ? 1 : 0,
          args.tier === 'partner_plus' ? 1 : 0,
        )
        .run();
    }
  } catch (err) {
    console.log(
      JSON.stringify({
        type: 'daily_user_write_error',
        detail: (err as Error).message,
      }),
    );
  }
}

/**
 * SHA-256(receiptHash + ":" + date) truncated to 16 hex chars. Rotates
 * nightly — yesterday's fingerprint cannot be linked to today's without
 * the raw receipt hash, which we never store.
 */
export async function fingerprintForDay(
  receiptHash: string,
  date: string,
): Promise<string> {
  const g = globalThis as unknown as {
    crypto?: { subtle?: SubtleCrypto };
  };
  const encoder = new TextEncoder();
  const data = encoder.encode(`${receiptHash}:${date}`);
  if (g.crypto?.subtle) {
    const digest = await g.crypto.subtle.digest('SHA-256', data);
    return toHex(digest).slice(0, 16);
  }
  // Fallback for test environments without WebCrypto.
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data[i]!) | 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 16);
}

function toHex(buf: ArrayBuffer): string {
  const view = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < view.length; i++) {
    out += view[i]!.toString(16).padStart(2, '0');
  }
  return out;
}

// ── Client-side metrics ingest (POST /ai/metrics) ──────────────────

export type ClientMetricEvent =
  | 'peek_opened'
  | 'peek_dismissed'
  | 'home_card_tapped'
  | 'home_card_dismissed'
  | 'citation_tapped'
  | 'mini_conversation_turns';

export interface ClientMetricsPayload {
  events: Array<{
    name: ClientMetricEvent;
    count: number;
    /** Optional categorical tag (e.g. '1-turn', '3+-turn'). */
    tag?: string;
  }>;
}

const VALID_EVENT_NAMES: readonly ClientMetricEvent[] = [
  'peek_opened',
  'peek_dismissed',
  'home_card_tapped',
  'home_card_dismissed',
  'citation_tapped',
  'mini_conversation_turns',
];

export function validateClientMetricsPayload(
  body: unknown,
): ClientMetricsPayload | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.events)) return null;
  const events: ClientMetricsPayload['events'] = [];
  for (const raw of b.events) {
    if (!raw || typeof raw !== 'object') return null;
    const ev = raw as Record<string, unknown>;
    if (
      typeof ev.name !== 'string' ||
      !VALID_EVENT_NAMES.includes(ev.name as ClientMetricEvent)
    ) {
      return null;
    }
    if (
      typeof ev.count !== 'number' ||
      !Number.isFinite(ev.count) ||
      ev.count < 0 ||
      ev.count > 10_000
    ) {
      return null;
    }
    const ret: ClientMetricsPayload['events'][number] = {
      name: ev.name as ClientMetricEvent,
      count: Math.floor(ev.count),
    };
    if (typeof ev.tag === 'string' && ev.tag.length <= 40) {
      ret.tag = ev.tag;
    }
    events.push(ret);
  }
  return { events };
}

export async function recordClientMetrics(
  env: Env,
  payload: ClientMetricsPayload,
  now: () => Date = () => new Date(),
): Promise<void> {
  if (!env.CORPUS_GAPS) return;
  const bucket = hourBucket(now());
  try {
    for (const ev of payload.events) {
      await env.CORPUS_GAPS.prepare(
        `INSERT INTO amicus_client_events
           (hour_bucket, event_name, event_tag, event_count)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(hour_bucket, event_name, event_tag)
           DO UPDATE SET event_count = event_count + excluded.event_count`,
      )
        .bind(bucket, ev.name, ev.tag ?? '', ev.count)
        .run();
    }
  } catch (err) {
    console.log(
      JSON.stringify({
        type: 'client_metric_write_error',
        detail: (err as Error).message,
      }),
    );
  }
}
