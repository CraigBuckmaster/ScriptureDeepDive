/**
 * index.ts — Worker entry point + router.
 *
 * Three endpoints:
 *   GET  /ai/health  — unauthenticated liveness probe
 *   POST /ai/embed   — authenticated, single 1536-dim vector via OpenAI
 *   POST /ai/chat    — authenticated, streaming Claude response via Anthropic
 *
 * Logs only metadata (user_id hash, token counts, latency). Never logs
 * request bodies or response text.
 */
import { authenticate, type AuthResult } from './auth';
import { checkAndIncrement } from './rateLimit';
import { streamChat } from './anthropic';
import { captureGap, parseGapSignal } from './gapDetection';
import type { ChatRequest, EmbedRequest, Env } from './types';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const startedAt = Date.now();

    try {
      if (url.pathname === '/ai/health' && request.method === 'GET') {
        return handleHealth(env);
      }
      if (url.pathname === '/ai/embed' && request.method === 'POST') {
        return handleEmbed(request, env, ctx, startedAt);
      }
      if (url.pathname === '/ai/chat' && request.method === 'POST') {
        return handleChat(request, env, ctx, startedAt);
      }
      return new Response('not found', { status: 404 });
    } catch (err) {
      console.log(
        JSON.stringify({
          type: 'unhandled_error',
          path: url.pathname,
          detail: (err as Error).message,
        }),
      );
      return new Response('internal error', { status: 500 });
    }
  },
};

// ── /ai/health ────────────────────────────────────────────────────────

function handleHealth(env: Env): Response {
  return new Response(JSON.stringify({ status: 'ok', version: env.VERSION }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

// ── /ai/embed ─────────────────────────────────────────────────────────

async function handleEmbed(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  startedAt: number,
): Promise<Response> {
  const auth = await authenticate(request.headers.get('Authorization'), env);
  const authResponse = authToHttp(auth);
  if (authResponse) return authResponse;
  const ctx = (auth as Extract<AuthResult, { ok: true }>).context;

  let body: EmbedRequest;
  try {
    body = (await request.json()) as EmbedRequest;
  } catch {
    return jsonError(400, 'invalid_json');
  }
  if (typeof body.text !== 'string' || body.text.length === 0) {
    return jsonError(400, 'missing_text');
  }
  if (!env.OPENAI_API_KEY) {
    return jsonError(503, 'openai_key_missing');
  }

  let upstream: Response;
  try {
    upstream = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: body.text }),
    });
  } catch (err) {
    return jsonError(503, 'openai_unreachable', (err as Error).message);
  }

  if (!upstream.ok) {
    return jsonError(upstream.status, 'openai_error');
  }
  const payload = (await upstream.json()) as { data?: Array<{ embedding?: number[] }> };
  const vector = payload.data?.[0]?.embedding;
  if (!vector || vector.length !== 1536) {
    return jsonError(502, 'openai_bad_shape');
  }

  logMetadata({
    endpoint: '/ai/embed',
    status: 200,
    startedAt,
    entitlement: ctx.entitlement,
    receiptHash: ctx.receiptHash,
  });

  return new Response(JSON.stringify({ vector }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

// ── /ai/chat ──────────────────────────────────────────────────────────

async function handleChat(
  request: Request,
  env: Env,
  execCtx: ExecutionContext,
  startedAt: number,
): Promise<Response> {
  const auth = await authenticate(request.headers.get('Authorization'), env);
  const authResponse = authToHttp(auth);
  if (authResponse) return authResponse;
  const ctx = (auth as Extract<AuthResult, { ok: true }>).context;

  const rate = await checkAndIncrement(ctx, env);
  if (!rate.allowed) {
    const body: Record<string, unknown> = {
      error: 'rate_limit_exceeded',
      retry_after: rate.retryAfterSec ?? 60,
    };
    if (ctx.entitlement === 'premium') {
      body.upgrade_url = 'https://contentcompanionstudy.com/amicus-plus';
    }
    return new Response(JSON.stringify(body), {
      status: 429,
      headers: { ...JSON_HEADERS, 'Retry-After': String(rate.retryAfterSec ?? 60) },
    });
  }

  let chat: ChatRequest;
  try {
    chat = (await request.json()) as ChatRequest;
  } catch {
    return jsonError(400, 'invalid_json');
  }

  if (typeof chat.query !== 'string' || chat.query.length === 0) {
    return jsonError(400, 'missing_query');
  }
  if (!env.ANTHROPIC_API_KEY) {
    return jsonError(503, 'anthropic_key_missing');
  }

  const upstream = await streamChat({
    req: chat,
    entitlement: ctx.entitlement,
    apiKey: env.ANTHROPIC_API_KEY,
  });

  if (!upstream.ok || !upstream.body) {
    return jsonError(upstream.status || 502, 'anthropic_error');
  }

  // Tee the stream: forward one branch straight to the client, consume the
  // other server-side to extract the gap_signal envelope.
  const [clientBranch, serverBranch] = upstream.body.tee();
  execCtx.waitUntil(
    consumeForGap(serverBranch, chat.query, env, ctx.receiptHash),
  );

  logMetadata({
    endpoint: '/ai/chat',
    status: 200,
    startedAt,
    entitlement: ctx.entitlement,
    receiptHash: ctx.receiptHash,
  });

  return new Response(clientBranch, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

async function consumeForGap(
  stream: ReadableStream<Uint8Array>,
  query: string,
  env: Env,
  receiptHash: string,
): Promise<void> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let accumulated = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const ev = JSON.parse(payload) as {
            type?: string;
            delta?: { text?: string };
          };
          if (ev.type === 'content_block_delta' && typeof ev.delta?.text === 'string') {
            accumulated += ev.delta.text;
          }
        } catch {
          /* non-JSON data line — ignore */
        }
      }
    }
  } catch (err) {
    console.log(JSON.stringify({ type: 'gap_consume_error', detail: (err as Error).message }));
    return;
  }

  const signal = parseGapSignal(accumulated);
  if (!signal || !signal.gap) return;
  await captureGap({ signal, query, env, receiptHash });
}

// ── Helpers ───────────────────────────────────────────────────────────

function authToHttp(auth: AuthResult): Response | null {
  if (auth.ok) return null;
  switch (auth.reason.kind) {
    case 'missing_token':
    case 'malformed_token':
      return jsonError(401, auth.reason.kind);
    case 'no_entitlement':
      return jsonError(402, 'no_entitlement');
    case 'revenuecat_unavailable':
      return jsonError(503, 'revenuecat_unavailable', auth.reason.detail);
  }
}

function jsonError(status: number, error: string, detail?: string): Response {
  const body: Record<string, string | number> = { status, error };
  if (detail) body.detail = detail;
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function logMetadata(opts: {
  endpoint: string;
  status: number;
  startedAt: number;
  entitlement: string;
  receiptHash: string;
}): void {
  console.log(
    JSON.stringify({
      type: 'request',
      endpoint: opts.endpoint,
      status: opts.status,
      latency_ms: Date.now() - opts.startedAt,
      entitlement: opts.entitlement,
      user_hash: opts.receiptHash.slice(0, 8),
    }),
  );
}
