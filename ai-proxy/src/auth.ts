/**
 * auth.ts — RevenueCat receipt validation.
 *
 * Cached per-receipt in Workers KV for 5 minutes so we don't hit RevenueCat
 * on every streaming request. On auth failure we return a structured code so
 * the router can translate to HTTP 401/402/503.
 */
import type { AuthContext, Entitlement, Env } from './types';

const CACHE_TTL_SECONDS = 5 * 60;
const REVENUECAT_BASE = 'https://api.revenuecat.com/v1/subscribers';

export type AuthFailure =
  | { kind: 'missing_token' }
  | { kind: 'malformed_token' }
  | { kind: 'no_entitlement' }
  | { kind: 'revenuecat_unavailable'; detail: string };

export type AuthResult = { ok: true; context: AuthContext } | { ok: false; reason: AuthFailure };

export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return match ? match[1]!.trim() : null;
}

/**
 * SHA-256 of the receipt token, hex-encoded. Used as a KV cache key so the
 * raw receipt never touches logs or storage indices.
 */
export async function hashReceipt(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate the Authorization header against RevenueCat. Returns an
 * AuthContext on success or a structured failure. Never throws — all errors
 * are reported via the failure object so the caller can classify cleanly.
 */
export async function authenticate(
  authorization: string | null,
  env: Env,
  fetchImpl: typeof fetch = fetch,
): Promise<AuthResult> {
  const token = extractBearerToken(authorization);
  if (!token) {
    return { ok: false, reason: { kind: 'missing_token' } };
  }

  // Basic shape check — RevenueCat receipt tokens are long opaque strings.
  if (token.length < 16) {
    return { ok: false, reason: { kind: 'malformed_token' } };
  }

  const receiptHash = await hashReceipt(token);

  // Cache hit?
  const cached = await env.RATE_LIMITS.get(`auth:${receiptHash}`);
  if (cached) {
    if (cached === 'none') {
      return { ok: false, reason: { kind: 'no_entitlement' } };
    }
    if (cached === 'premium' || cached === 'partner_plus') {
      return { ok: true, context: { receiptHash, entitlement: cached } };
    }
  }

  if (!env.REVENUECAT_SECRET_KEY) {
    return {
      ok: false,
      reason: {
        kind: 'revenuecat_unavailable',
        detail: 'REVENUECAT_SECRET_KEY not configured',
      },
    };
  }

  let response: Response;
  try {
    response = await fetchImpl(`${REVENUECAT_BASE}/${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.REVENUECAT_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return {
      ok: false,
      reason: {
        kind: 'revenuecat_unavailable',
        detail: (err as Error).message,
      },
    };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, reason: { kind: 'malformed_token' } };
  }
  if (!response.ok) {
    return {
      ok: false,
      reason: {
        kind: 'revenuecat_unavailable',
        detail: `RevenueCat returned ${response.status}`,
      },
    };
  }

  const body = (await response.json()) as {
    subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> };
  };
  const entitlement = pickActiveEntitlement(body);

  await env.RATE_LIMITS.put(`auth:${receiptHash}`, entitlement ?? 'none', {
    expirationTtl: CACHE_TTL_SECONDS,
  });

  if (!entitlement) {
    return { ok: false, reason: { kind: 'no_entitlement' } };
  }
  return { ok: true, context: { receiptHash, entitlement } };
}

/**
 * Walk the RevenueCat subscriber response for an active entitlement.
 * Prefers `partner_plus` over plain `premium` when both are present.
 */
export function pickActiveEntitlement(
  body: { subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> } },
): Entitlement | null {
  const entitlements = body.subscriber?.entitlements ?? {};
  const now = Date.now();

  const isActive = (key: string): boolean => {
    const ent = entitlements[key];
    if (!ent) return false;
    if (ent.expires_date == null) return true; // lifetime / non-expiring
    const exp = Date.parse(ent.expires_date);
    return Number.isFinite(exp) && exp > now;
  };

  if (isActive('partner_plus')) return 'partner_plus';
  if (isActive('premium')) return 'premium';
  return null;
}
