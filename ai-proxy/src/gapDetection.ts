/**
 * gapDetection.ts — Extract the structured gap_signal JSON envelope from a
 * streamed assistant response.
 *
 * Full D1 persistence is #1471. This file provides the hook: it parses the
 * signal, writes a stub record to D1 when present, and is safe to call
 * even when CORPUS_GAPS isn't bound.
 */
import type { Env, GapSignal } from './types';

/**
 * Pull the last JSON object from the streamed text. Returns null if no
 * trailing JSON envelope is found, or if it doesn't match the gap schema.
 */
export function parseGapSignal(accumulated: string): GapSignal | null {
  const trimmed = accumulated.trim();
  if (!trimmed.endsWith('}')) return null;

  // Walk backward from the last } matching braces to find the JSON start.
  let depth = 0;
  let start = -1;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const c = trimmed[i];
    if (c === '}') depth++;
    else if (c === '{') {
      depth--;
      if (depth === 0) {
        start = i;
        break;
      }
    }
  }
  if (start < 0) return null;

  const candidate = trimmed.slice(start);
  try {
    const parsed = JSON.parse(candidate) as Record<string, unknown>;
    if (typeof parsed.gap !== 'boolean') return null;
    const out: GapSignal = { gap: parsed.gap };
    if (
      typeof parsed.gap_type === 'string' &&
      ['content', 'translation', 'out_of_scope'].includes(parsed.gap_type)
    ) {
      out.gap_type = parsed.gap_type as GapSignal['gap_type'];
    }
    if (typeof parsed.topic === 'string') out.topic = parsed.topic;
    return out;
  } catch {
    return null;
  }
}

export interface CaptureGapArgs {
  signal: GapSignal;
  query: string;
  env: Env;
  /** For logging only; never store raw receipts. */
  receiptHash: string;
}

/**
 * Stub writer. #1471 replaces this with the full D1 schema, semantic
 * deduplication, and GitHub sync. For now we emit a structured log line so
 * ops visibility is in place from day one.
 */
export async function captureGap({ signal, query, env, receiptHash }: CaptureGapArgs): Promise<void> {
  const record = {
    type: 'gap_signal',
    gap_type: signal.gap_type ?? 'unknown',
    topic: signal.topic ?? null,
    query_length: query.length,
    receipt_hash_prefix: receiptHash.slice(0, 8),
    captured_at: Date.now(),
  };
  // Structured log — Cloudflare observability picks this up.
  console.log(JSON.stringify(record));

  if (!env.CORPUS_GAPS) return;
  try {
    await env.CORPUS_GAPS.prepare(
      'INSERT INTO corpus_gaps (gap_id, gap_type, scrubbed_summary, captured_at) '
        + 'VALUES (?, ?, ?, ?)',
    )
      .bind(
        crypto.randomUUID(),
        signal.gap_type ?? 'content',
        signal.topic ?? '',
        Math.floor(Date.now() / 1000),
      )
      .run();
  } catch (err) {
    console.log(
      JSON.stringify({ type: 'gap_write_failed', detail: (err as Error).message }),
    );
  }
}
