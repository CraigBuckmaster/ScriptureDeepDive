/**
 * responseSampling.ts — Record a small, privacy-scrubbed fraction of
 * `/ai/chat` responses for the accuracy-audit pipeline (#1468).
 *
 * Three sample pools feed the same D1 table:
 *   - `random_1pct`   — 1% of successful responses
 *   - `gap_signal`    — written by gapDetection.ts (#1471)
 *   - `user_feedback` — written by /ai/feedback
 *
 * This module owns the `random_1pct` path. Schema lives alongside
 * `corpus_gaps` in the `amicus-gaps` D1 database so we reuse the same
 * binding.
 */
import type { ChatRequest, Env } from './types';

export const DEFAULT_SAMPLE_RATE = 0.01;

export type SampleReason = 'random_1pct' | 'gap_signal' | 'user_feedback';

export interface CitationRecord {
  chunk_id: string;
  source_type: string;
  display_label?: string;
  scholar_id?: string;
}

export interface ResponseSampleInput {
  chat: ChatRequest;
  responseText: string;
  citations: CitationRecord[];
  citedChunkIds: string[];
  modelTier: 'haiku' | 'sonnet';
  latencyMs: number;
  reason: SampleReason;
  receiptHash: string;
  env: Env;
  /** Injectable for tests (random roll). Defaults to `Math.random`. */
  rand?: () => number;
  /** Injectable for tests (id generation). Defaults to crypto.randomUUID. */
  makeId?: () => string;
  /** Override the sample rate (0..1). Defaults to 1% for `random_1pct`. */
  sampleRate?: number;
}

/** Returns the id of the written row if we sampled, null otherwise. */
export async function captureResponseSample(
  input: ResponseSampleInput,
): Promise<string | null> {
  const rand = input.rand ?? Math.random;
  const rate = input.sampleRate ?? DEFAULT_SAMPLE_RATE;

  if (input.reason === 'random_1pct') {
    if (rand() >= rate) return null;
  }

  if (!input.env.CORPUS_GAPS) return null;

  const sampleId = (input.makeId ?? fallbackId)();
  const capturedAt = Date.now();

  try {
    await input.env.CORPUS_GAPS.prepare(
      `INSERT INTO amicus_response_samples (
         sample_id, captured_at, query_text,
         compressed_profile, current_chapter_ref,
         retrieved_chunks_json, retrieved_chunks_used_json,
         response_text, citations_json,
         model_tier, latency_ms, sample_reason
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        sampleId,
        capturedAt,
        scrubQuery(input.chat.query),
        input.chat.profile_summary ?? '',
        input.chat.current_chapter_ref ?? null,
        JSON.stringify(
          (input.chat.retrieved_chunks ?? []).map((c) => ({
            chunk_id: c.chunk_id,
            source_type: c.source_type,
            scholar_id: (c as unknown as { scholar_id?: string }).scholar_id,
          })),
        ),
        JSON.stringify(input.citedChunkIds),
        scrubBody(input.responseText),
        JSON.stringify(input.citations),
        input.modelTier,
        input.latencyMs,
        input.reason,
      )
      .run();
    return sampleId;
  } catch (err) {
    console.log(
      JSON.stringify({
        type: 'response_sample_write_error',
        detail: (err as Error).message,
      }),
    );
    return null;
  }
}

function fallbackId(): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return `rs-${g.crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(16).slice(2, 10);
  return `rs-${Date.now().toString(16)}-${rand}`;
}

const EMAIL_RE = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,63}/g;
const PHONE_RE = /\+?\d[\d\s().-]{8,}\d/g;

/** Remove obvious PII before storing the raw question/response. */
export function scrubQuery(text: string): string {
  return text
    .replace(EMAIL_RE, '[email]')
    .replace(PHONE_RE, '[phone]')
    .slice(0, 2000);
}

export function scrubBody(text: string): string {
  return text
    .replace(EMAIL_RE, '[email]')
    .replace(PHONE_RE, '[phone]')
    .slice(0, 12000);
}
