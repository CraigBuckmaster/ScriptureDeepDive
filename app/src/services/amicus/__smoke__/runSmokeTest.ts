/**
 * services/amicus/__smoke__/runSmokeTest.ts — dev harness for the Phase 1
 * end-to-end smoke test.
 *
 * Iterates the 10 canned queries, drives the full client pipeline through
 * proxy /ai/chat, and produces a structured report. Designed to be invoked
 * from the AmicusSmokeScreen dev UI and consumed either visually or as JSON.
 */
import { retrieve } from '@/services/amicus/retrieval';
import { generateProfile } from '@/services/amicus/profile/generator';
import type { ChunkSourceType, RetrievedChunk } from '@/services/amicus/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CANNED_QUERIES = require('./canned_queries.json') as CannedQuery[];

export interface CannedQuery {
  id: string;
  query: string;
  current_chapter_ref: { book_id: string; chapter_num: number } | null;
  expected_citations: {
    must_include_any_of: string[];
    must_include_source_types: ChunkSourceType[];
    must_not_include: string[];
  };
  expected_behavior: string;
}

export interface QueryResult {
  query_id: string;
  query: string;
  passed: boolean;
  citations: string[];
  source_types: ChunkSourceType[];
  latency_ms: number;
  tokens_in: number;
  tokens_out: number;
  gap_signal: { gap: boolean; gap_type?: string; topic?: string } | null;
  failures: string[];
  raw_response_preview: string;
}

export interface SmokeReport {
  started_at: string;
  finished_at: string;
  total: number;
  passed: number;
  gap_tests_passed: number;
  latency_ms_p50: number;
  latency_ms_p95: number;
  results: QueryResult[];
}

const CHAT_URL_DEFAULT = (
  process.env.EXPO_PUBLIC_AMICUS_PROXY_URL ?? 'https://ai.contentcompanionstudy.com'
).replace(/\/$/, '') + '/ai/chat';

export interface RunOptions {
  authToken: string;
  chatUrl?: string;
  fetchImpl?: typeof fetch;
  /** Progress callback fired as each query completes. */
  onProgress?: (index: number, result: QueryResult) => void;
}

export async function runSmokeTest(opts: RunOptions): Promise<SmokeReport> {
  const startedAt = new Date().toISOString();
  const results: QueryResult[] = [];
  const profile = await generateProfile(false);
  const chatUrl = opts.chatUrl ?? CHAT_URL_DEFAULT;

  for (let i = 0; i < CANNED_QUERIES.length; i++) {
    const q = CANNED_QUERIES[i]!;
    const result = await runOne(q, profile, opts.authToken, chatUrl, opts.fetchImpl);
    results.push(result);
    opts.onProgress?.(i, result);
  }

  const latencies = results.map((r) => r.latency_ms).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
  const passed = results.filter((r) => r.passed).length;
  const gapTestIds = new Set(
    CANNED_QUERIES.filter((q) => q.expected_behavior.includes('corpus gap')).map(
      (q) => q.id,
    ),
  );
  const gapTests = results.filter((r) => gapTestIds.has(r.query_id));

  return {
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    total: results.length,
    passed,
    gap_tests_passed: gapTests.filter((r) => r.gap_signal?.gap).length,
    latency_ms_p50: p50,
    latency_ms_p95: p95,
    results,
  };
}

export function summarize(report: SmokeReport): string {
  return (
    `Amicus Smoke Report — ${report.passed}/${report.total} passed, ` +
    `p50 ${report.latency_ms_p50}ms p95 ${report.latency_ms_p95}ms. ` +
    `Started ${report.started_at}.`
  );
}

// ── One-query runner ──────────────────────────────────────────────────

async function runOne(
  q: CannedQuery,
  profile: Awaited<ReturnType<typeof generateProfile>>,
  authToken: string,
  chatUrl: string,
  fetchImpl?: typeof fetch,
): Promise<QueryResult> {
  const failures: string[] = [];
  const started = Date.now();
  let citations: string[] = [];
  let sourceTypes: ChunkSourceType[] = [];
  let tokensIn = 0;
  let tokensOut = 0;
  let gapSignal: QueryResult['gap_signal'] = null;
  let preview = '';

  try {
    const retrieved = await retrieve(
      {
        query: q.query,
        profile,
        currentChapterRef: q.current_chapter_ref,
      },
      { authToken, fetchImpl },
    );

    const chunks: RetrievedChunk[] = retrieved.chunks;
    const accumulated = await streamChat({
      authToken,
      chatUrl,
      fetchImpl,
      chat: {
        query: q.query,
        retrieved_chunks: chunks.map((c) => ({
          chunk_id: c.chunk_id,
          source_type: c.source_type,
          text: c.text,
          metadata: c.metadata,
        })),
        profile_summary: profile.prose,
        current_chapter_ref: q.current_chapter_ref
          ? `${q.current_chapter_ref.book_id}/${q.current_chapter_ref.chapter_num}`
          : null,
        model_tier: 'haiku',
        conversation_history: [],
      },
    });

    citations = extractCitations(accumulated.text);
    sourceTypes = Array.from(new Set(chunks.map((c) => c.source_type)));
    tokensIn = accumulated.tokens_in;
    tokensOut = accumulated.tokens_out;
    gapSignal = extractTrailingJson(accumulated.text);
    preview = accumulated.text.slice(0, 220);

    // Assert against expectations
    const isGapTest = q.expected_behavior.includes('corpus gap');
    if (isGapTest) {
      if (!gapSignal?.gap) failures.push('expected gap_signal.gap=true, got none');
    } else {
      assertCitations(q, citations, sourceTypes, failures);
    }
  } catch (err) {
    failures.push(`retrieval error: ${(err as Error).message ?? String(err)}`);
  }

  const latency = Date.now() - started;
  return {
    query_id: q.id,
    query: q.query,
    passed: failures.length === 0,
    citations,
    source_types: sourceTypes,
    latency_ms: latency,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    gap_signal: gapSignal,
    failures,
    raw_response_preview: preview,
  };
}

function assertCitations(
  q: CannedQuery,
  citations: string[],
  sourceTypes: ChunkSourceType[],
  failures: string[],
): void {
  const cset = new Set(citations);
  const anyOf = q.expected_citations.must_include_any_of;
  if (anyOf.length > 0 && !anyOf.some((c) => cset.has(c))) {
    failures.push(
      `none of must_include_any_of present: ${anyOf.join(', ')}`,
    );
  }
  const tset = new Set(sourceTypes);
  for (const t of q.expected_citations.must_include_source_types) {
    if (!tset.has(t)) failures.push(`missing source_type: ${t}`);
  }
  for (const forbidden of q.expected_citations.must_not_include) {
    if (cset.has(forbidden)) failures.push(`forbidden citation: ${forbidden}`);
  }
}

// ── Streaming chat + token accounting ─────────────────────────────────

interface ChatPayload {
  query: string;
  retrieved_chunks: unknown[];
  profile_summary: string;
  current_chapter_ref: string | null;
  model_tier: 'haiku' | 'sonnet';
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

async function streamChat(args: {
  authToken: string;
  chatUrl: string;
  fetchImpl?: typeof fetch;
  chat: ChatPayload;
}): Promise<{ text: string; tokens_in: number; tokens_out: number }> {
  const resp = await (args.fetchImpl ?? fetch)(args.chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify(args.chat),
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`chat proxy ${resp.status}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let tokensIn = 0;
  let tokensOut = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    for (const line of text.split('\n')) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const ev = JSON.parse(payload) as {
          type?: string;
          delta?: { text?: string };
          message?: { usage?: { input_tokens?: number; output_tokens?: number } };
          usage?: { input_tokens?: number; output_tokens?: number };
        };
        if (ev.type === 'content_block_delta' && ev.delta?.text) {
          accumulated += ev.delta.text;
        }
        const usage = ev.message?.usage ?? ev.usage;
        if (usage) {
          tokensIn += usage.input_tokens ?? 0;
          tokensOut += usage.output_tokens ?? 0;
        }
      } catch {
        /* non-JSON — ignore */
      }
    }
  }
  return { text: accumulated, tokens_in: tokensIn, tokens_out: tokensOut };
}

// ── Parsing helpers ───────────────────────────────────────────────────

/** Pulls `[source_type:source_id]`-style citations out of free text. */
export function extractCitations(text: string): string[] {
  const out = new Set<string>();
  const re = /\[([a-z_]+:[A-Za-z0-9_\-.]+)]/g;
  for (const match of text.matchAll(re)) {
    if (match[1]) out.add(match[1]);
  }
  return Array.from(out);
}

export function extractTrailingJson(
  text: string,
): { gap: boolean; gap_type?: string; topic?: string } | null {
  const trimmed = text.trim();
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
    return {
      gap: parsed.gap,
      gap_type: typeof parsed.gap_type === 'string' ? parsed.gap_type : undefined,
      topic: typeof parsed.topic === 'string' ? parsed.topic : undefined,
    };
  } catch {
    return null;
  }
}

export { CANNED_QUERIES };
