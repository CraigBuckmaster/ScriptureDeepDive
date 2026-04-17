/**
 * types.ts — Shared types for the Amicus proxy.
 *
 * Keep this file small and stable; both the Worker implementation and the
 * tests depend on these definitions.
 */

export type Entitlement = 'premium' | 'partner_plus';

export type ModelTier = 'haiku' | 'sonnet';

export interface RetrievedChunk {
  chunk_id: string;
  source_type: string;
  text: string;
  metadata: Record<string, unknown>;
}

export interface ChatRequest {
  query: string;
  retrieved_chunks: RetrievedChunk[];
  profile_summary: string;
  current_chapter_ref: string | null;
  model_tier: ModelTier;
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface EmbedRequest {
  text: string;
}

export interface AuthContext {
  receiptHash: string;
  entitlement: Entitlement;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
  monthlyRemaining: number;
  burstRemaining: number;
}

export interface GapSignal {
  gap: boolean;
  gap_type?: 'content' | 'translation' | 'out_of_scope';
  topic?: string;
}

/**
 * Worker environment bindings. These are declared in wrangler.toml (KV,
 * D1, vars) or set via `wrangler secret put` (API keys).
 */
export interface Env {
  // Secrets
  REVENUECAT_SECRET_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;

  // Vars
  VERSION: string;

  // KV + D1
  RATE_LIMITS: KVNamespace;
  CORPUS_GAPS?: D1Database;
}
