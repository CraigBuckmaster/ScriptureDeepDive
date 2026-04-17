/**
 * services/amicus/embed.ts — Embed a user query via the Amicus proxy.
 *
 * The proxy (#1450) forwards to OpenAI `text-embedding-3-small` and returns
 * a 1536-dim vector. We retry exactly once on network / 5xx so a flaky
 * connection doesn't instantly disable Amicus.
 */
import { AmicusError } from './types';
import { logger } from '@/utils/logger';

const PROXY_BASE =
  (process.env.EXPO_PUBLIC_AMICUS_PROXY_URL ?? 'https://ai.contentcompanionstudy.com').replace(/\/$/, '');

const EMBED_DIM = 1536;

export interface EmbedOptions {
  /** RevenueCat receipt token used as the Authorization bearer. */
  authToken: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
  /** Soft timeout for each attempt, ms. */
  timeoutMs?: number;
}

export async function embedQuery(text: string, opts: EmbedOptions): Promise<number[]> {
  if (!text.trim()) {
    throw new AmicusError('EMBED_FAILED', 'empty query');
  }

  const attempt = async (): Promise<Response> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 5000);
    try {
      return await (opts.fetchImpl ?? fetch)(`${PROXY_BASE}/ai/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.authToken}`,
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }
  };

  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const resp = await attempt();
      if (resp.status === 401 || resp.status === 402) {
        throw new AmicusError('PROXY_UNAUTHORIZED', `proxy ${resp.status}`);
      }
      if (!resp.ok) {
        lastErr = new Error(`proxy ${resp.status}`);
        if (resp.status < 500) break; // 4xx won't get better by retrying
        continue;
      }
      const payload = (await resp.json()) as { vector?: number[] };
      if (!Array.isArray(payload.vector) || payload.vector.length !== EMBED_DIM) {
        throw new AmicusError('EMBED_FAILED', 'invalid vector shape');
      }
      return payload.vector;
    } catch (err) {
      if (err instanceof AmicusError) throw err;
      lastErr = err;
      // AbortError / network error — retry once, then bail as OFFLINE.
      if (i === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      logger.warn('Amicus', 'embed failed after retry', err);
      throw new AmicusError('OFFLINE', (err as Error).message ?? 'network');
    }
  }
  logger.warn('Amicus', 'embed failed', lastErr);
  throw new AmicusError('EMBED_FAILED', (lastErr as Error)?.message ?? 'unknown');
}

export const _internal = { EMBED_DIM, PROXY_BASE };
