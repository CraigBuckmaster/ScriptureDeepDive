/**
 * gapDetection.ts — Full corpus-gap capture (Card #1471).
 *
 * Three inputs can flag a gap:
 *   1. Model self-report via trailing {"gap": true, ...} envelope
 *   2. Retrieval max similarity below GAP_SIMILARITY_FLOOR
 *   3. Explicit user thumbs-down (POST /ai/feedback)
 *
 * Each capture:
 *   - Embeds the question for semantic dedup (cosine >0.9 → increment
 *     occurrence_count on existing gap instead of inserting a new row)
 *   - Writes a row to D1
 *   - Fire-and-forget kicks downstream sync (GitHub issue creation lives
 *     in _tools/corpus_gap_sync.py, run on a cron schedule)
 */
import type { Env, GapSignal, RetrievedChunk } from './types';

export const GAP_SIMILARITY_FLOOR = 0.55;
export const DEDUP_COSINE_THRESHOLD = 0.9;

/**
 * Pull the last JSON object from the streamed text. Returns null when no
 * trailing JSON envelope is found or it doesn't match the gap schema.
 */
export function parseGapSignal(accumulated: string): GapSignal | null {
  const trimmed = accumulated.trim();
  if (!trimmed.endsWith('}')) return null;

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

  try {
    const parsed = JSON.parse(trimmed.slice(start)) as Record<string, unknown>;
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

/**
 * Retrieval score is a gap indicator. Returns true if the max similarity
 * is below the floor — i.e. the retriever thinks nothing in the corpus is
 * a close match.
 */
export function isLowRetrievalScore(chunks: RetrievedChunk[]): boolean {
  if (chunks.length === 0) return true;
  let max = 0;
  for (const c of chunks) {
    const score = (c as unknown as { score?: number }).score ?? 0;
    if (score > max) max = score;
  }
  return max < GAP_SIMILARITY_FLOOR;
}

// ── Scrub ─────────────────────────────────────────────────────────────

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const URL_RE = /https?:\/\/\S+/g;
const CARD_RE = /\b(?:\d[ -]*?){13,16}\b/g;

/** Light PII scrub for the raw question_text stored in D1. */
export function scrubPII(text: string): string {
  return text
    .replace(EMAIL_RE, '[email]')
    .replace(URL_RE, '[url]')
    .replace(CARD_RE, '[card]')
    .replace(PHONE_RE, '[phone]')
    .trim();
}

// ── Semantic dedup ────────────────────────────────────────────────────

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i]!;
    const bv = b[i]!;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function packEmbedding(vector: number[]): Uint8Array {
  const buf = new ArrayBuffer(vector.length * 4);
  const view = new DataView(buf);
  for (let i = 0; i < vector.length; i++) view.setFloat32(i * 4, vector[i]!, true);
  return new Uint8Array(buf);
}

export function unpackEmbedding(blob: ArrayBuffer | Uint8Array): Float32Array {
  const ab = blob instanceof Uint8Array ? blob.buffer : blob;
  return new Float32Array(ab);
}

/**
 * Scan recent open gaps for a semantic match. Returns the matching gap_id
 * if found (occurrence_count should be incremented), else null.
 */
export async function findSemanticMatch(
  env: Env,
  embedding: number[],
): Promise<string | null> {
  if (!env.CORPUS_GAPS) return null;
  const target = new Float32Array(embedding);

  try {
    const rows = await env.CORPUS_GAPS.prepare(
      `SELECT gap_id, question_embedding
         FROM corpus_gaps
        WHERE status IN ('new', 'queued', 'issue_opened')
          AND redacted = 0
          AND question_embedding IS NOT NULL
        ORDER BY captured_at DESC
        LIMIT 500`,
    ).all<{ gap_id: string; question_embedding: ArrayBuffer }>();

    for (const r of rows.results ?? []) {
      const existing = unpackEmbedding(r.question_embedding);
      if (existing.length !== target.length) continue;
      const sim = cosineSimilarity(target, existing);
      if (sim >= DEDUP_COSINE_THRESHOLD) return r.gap_id;
    }
  } catch (err) {
    console.log(
      JSON.stringify({ type: 'dedup_error', detail: (err as Error).message }),
    );
  }
  return null;
}

// ── Scrubbed summary via Haiku ───────────────────────────────────────

const HAIKU_MODEL_FOR_SUMMARY = 'claude-haiku-4-5-20251001';

export async function generateScrubbedSummary(
  rawQuestion: string,
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const fallback = scrubPII(rawQuestion).slice(0, 160);
  if (!env.ANTHROPIC_API_KEY) return fallback;

  try {
    const resp = await fetchImpl('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-no-retention': 'true',
      },
      body: JSON.stringify({
        model: HAIKU_MODEL_FOR_SUMMARY,
        max_tokens: 80,
        messages: [
          {
            role: 'user',
            content:
              'Paraphrase the following user question into one short, non-identifying, topical summary suitable for a corpus-gap ticket (max 20 words, no names, no personal detail):\n\n' +
              scrubPII(rawQuestion),
          },
        ],
      }),
    });
    if (!resp.ok) return fallback;
    const payload = (await resp.json()) as {
      content?: Array<{ text?: string }>;
    };
    const text = payload.content?.[0]?.text?.trim();
    return text && text.length > 0 ? text : fallback;
  } catch {
    return fallback;
  }
}

// ── Capture + persistence ────────────────────────────────────────────

export interface CaptureGapArgs {
  signal: GapSignal;
  query: string;
  retrievalMaxScore: number | null;
  retrievedChunkIds: string[];
  profileSummary: string;
  currentChapterRef: string | null;
  questionEmbedding: number[] | null;
  env: Env;
  receiptHash: string;
  fetchImpl?: typeof fetch;
}

export async function captureGap(args: CaptureGapArgs): Promise<void> {
  const {
    signal,
    query,
    retrievalMaxScore,
    retrievedChunkIds,
    profileSummary,
    currentChapterRef,
    questionEmbedding,
    env,
    receiptHash,
    fetchImpl,
  } = args;

  const record = {
    type: 'gap_signal',
    gap_type: signal.gap_type ?? 'content',
    topic: signal.topic ?? null,
    retrieval_max_score: retrievalMaxScore,
    query_length: query.length,
    receipt_hash_prefix: receiptHash.slice(0, 8),
    captured_at: Date.now(),
  };
  console.log(JSON.stringify(record));

  if (!env.CORPUS_GAPS) return;

  if (questionEmbedding) {
    const existingId = await findSemanticMatch(env, questionEmbedding);
    if (existingId) {
      try {
        await env.CORPUS_GAPS.prepare(
          `UPDATE corpus_gaps
              SET occurrence_count = occurrence_count + 1,
                  captured_at = ?
            WHERE gap_id = ?`,
        )
          .bind(Math.floor(Date.now() / 1000), existingId)
          .run();
        console.log(JSON.stringify({ type: 'gap_deduped', gap_id: existingId }));
      } catch (err) {
        console.log(
          JSON.stringify({
            type: 'gap_dedup_write_failed',
            detail: (err as Error).message,
          }),
        );
      }
      return;
    }
  }

  const gapId = crypto.randomUUID();
  const scrubbedSummary = await generateScrubbedSummary(query, env, fetchImpl);

  try {
    await env.CORPUS_GAPS.prepare(
      `INSERT INTO corpus_gaps
         (gap_id, question_text, question_embedding, scrubbed_summary,
          compressed_profile, current_chapter_ref, retrieved_chunks_json,
          retrieval_max_score, gap_type, captured_at, occurrence_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'new')`,
    )
      .bind(
        gapId,
        scrubPII(query),
        questionEmbedding ? packEmbedding(questionEmbedding) : null,
        scrubbedSummary,
        profileSummary.slice(0, 2000),
        currentChapterRef,
        JSON.stringify(retrievedChunkIds),
        retrievalMaxScore,
        signal.gap_type ?? 'content',
        Math.floor(Date.now() / 1000),
      )
      .run();
    console.log(JSON.stringify({ type: 'gap_captured', gap_id: gapId }));
  } catch (err) {
    console.log(
      JSON.stringify({ type: 'gap_write_failed', detail: (err as Error).message }),
    );
  }
}

export async function redactGap(env: Env, gapId: string): Promise<boolean> {
  if (!env.CORPUS_GAPS) return false;
  try {
    await env.CORPUS_GAPS.prepare(
      `UPDATE corpus_gaps
          SET redacted = 1,
              status = 'redacted',
              question_text = NULL,
              question_embedding = NULL,
              scrubbed_summary = '[redacted]',
              compressed_profile = NULL,
              retrieved_chunks_json = NULL
        WHERE gap_id = ?`,
    )
      .bind(gapId)
      .run();
    return true;
  } catch (err) {
    console.log(
      JSON.stringify({
        type: 'redact_failed',
        gap_id: gapId,
        detail: (err as Error).message,
      }),
    );
    return false;
  }
}
