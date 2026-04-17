/**
 * services/amicus/queryRouting.ts — Query complexity classifier + route
 * selector (#1473, inert scaffold).
 *
 * Today every query routes to `cloud`. The card to evaluate Apple
 * Foundation Models is deferred until cloud spend crosses the trigger
 * threshold. This module exists so that when the trigger fires, the
 * call-site surface can stay unchanged — a future PR wires the
 * `apple_fm` branch behind a capability check without touching the
 * streaming chat handler.
 *
 * See `docs/decisions/1473-apple-foundation-models-deferral.md`.
 */

/** Hard cap used by the simple-query classifier. */
export const SIMPLE_MAX_CHUNKS = 2;

/** Query is considered short below this character count (≈ 100 tokens). */
export const SIMPLE_MAX_QUERY_CHARS = 400;

export interface QueryClassifierInput {
  /** Raw user query. */
  query: string;
  /** Number of chunks the retriever surfaced. */
  retrievedChunkCount: number;
  /** Prior user/assistant turns in the same thread. */
  conversationHistoryLength: number;
}

export type QueryComplexity = 'simple' | 'complex';

/**
 * Per the #1473 spec:
 *   simple  = retrieved_chunks ≤ 2 AND no multi-turn context AND query < 100 tokens
 *   complex = everything else
 *
 * The 100-token rule is approximated as 400 characters — English averages
 * ~4 characters per token. The classifier is intentionally generous on
 * the threshold so a future PR can tighten it without breaking callers.
 */
export function classifyQuery(input: QueryClassifierInput): QueryComplexity {
  if (input.retrievedChunkCount > SIMPLE_MAX_CHUNKS) return 'complex';
  if (input.conversationHistoryLength > 0) return 'complex';
  if (input.query.trim().length >= SIMPLE_MAX_QUERY_CHARS) return 'complex';
  return 'simple';
}

/** Routes the query dispatcher will eventually pick from. */
export type QueryRoute = 'cloud' | 'apple_fm';

export interface PickRouteOptions {
  /** The query's classification. */
  complexity: QueryComplexity;
  /**
   * Whether the runtime exposes Apple Foundation Models. Today this is
   * always `false` — the eval is deferred.
   */
  appleFmAvailable?: boolean;
}

/**
 * Select the route for a classified query. Simple queries with an Apple
 * FM runtime *could* route on-device; today that branch is off.
 */
export function pickRoute(opts: PickRouteOptions): QueryRoute {
  if (opts.complexity === 'simple' && opts.appleFmAvailable === true) {
    return 'apple_fm';
  }
  return 'cloud';
}

/**
 * Convenience wrapper so callers don't need to thread complexity through
 * their own state. `appleFmAvailable` is intentionally not surfaced at
 * the public call sites until the feasibility audit completes.
 */
export function resolveRoute(input: QueryClassifierInput): QueryRoute {
  return pickRoute({ complexity: classifyQuery(input) });
}
