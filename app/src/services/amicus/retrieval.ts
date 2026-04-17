/**
 * services/amicus/retrieval.ts — Top-level Amicus retrieval orchestrator.
 *
 * Pipeline:
 *   1. embed query via proxy /ai/embed
 *   2. sqlite-vec MATCH against scripture.db (local)
 *   3. re-rank with profile + context boosts, diversify, top-10
 *
 * Typed errors bubble up so UI can choose graceful fallback:
 *   - AmicusError.EMBED_FAILED        — proxy 4xx/5xx or shape mismatch
 *   - AmicusError.OFFLINE             — network unreachable
 *   - AmicusError.EXTENSION_NOT_LOADED — sqlite-vec not loaded on the connection
 *   - AmicusError.PROXY_UNAUTHORIZED   — 401/402 from proxy
 */
import { embedQuery } from './embed';
import { rerank } from './rerank';
import { searchByVector } from './vectorSearch';
import { AmicusError, type RetrievalContext, type RetrievedChunk } from './types';
import { logger } from '@/utils/logger';

export interface RetrieveOptions {
  /** Bearer token for the proxy. Usually the RevenueCat receipt. */
  authToken: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  /** Vector-search candidate pool size before re-ranking. */
  candidatePoolSize?: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  /** Milliseconds spent embedding (proxy round-trip). */
  embedMs: number;
  /** Milliseconds spent in sqlite-vec search + hydration. */
  searchMs: number;
  /** Milliseconds spent re-ranking. */
  rerankMs: number;
}

export async function retrieve(
  ctx: RetrievalContext,
  opts: RetrieveOptions,
): Promise<RetrievalResult> {
  const startEmbed = Date.now();
  let vector: number[];
  try {
    vector = await embedQuery(ctx.query, {
      authToken: opts.authToken,
      fetchImpl: opts.fetchImpl,
    });
  } catch (err) {
    if (err instanceof AmicusError) throw err;
    throw new AmicusError('EMBED_FAILED', (err as Error).message);
  }
  const embedMs = Date.now() - startEmbed;

  const startSearch = Date.now();
  const candidates = await searchByVector(vector, {
    limit: opts.candidatePoolSize ?? 40,
  });
  const searchMs = Date.now() - startSearch;

  const startRerank = Date.now();
  const chunks = rerank(candidates, ctx.profile, ctx.currentChapterRef);
  const rerankMs = Date.now() - startRerank;

  logger.info(
    'Amicus',
    `retrieval: ${chunks.length} chunks (embed ${embedMs}ms, search ${searchMs}ms, rerank ${rerankMs}ms)`,
  );

  return { chunks, embedMs, searchMs, rerankMs };
}
