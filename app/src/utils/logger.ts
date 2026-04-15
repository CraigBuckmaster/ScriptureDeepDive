/**
 * utils/logger.ts — Centralized logging utility.
 *
 * Replaces bare console.log/warn/error calls with tagged, gated output.
 * - info: only in __DEV__ (stripped from production)
 * - warn: always logged + sent to Sentry as message
 * - error: always logged + sent to Sentry as exception
 */
/* eslint-disable no-console */

import { Sentry, DSN } from '../lib/sentry';

const IS_DEV = __DEV__;

export const logger = {
  /** Debug/trace info — suppressed in production. */
  info(tag: string, msg: string, data?: unknown): void {
    if (IS_DEV) console.log(`[${tag}] ${msg}`, data ?? '');
  },

  /** Recoverable issue — always logged. */
  warn(tag: string, msg: string, data?: unknown): void {
    console.warn(`[${tag}] ${msg}`, data ?? '');
    if (DSN && Sentry) {
      Sentry.captureMessage(`[${tag}] ${msg}`, 'warning');
    }
  },

  /** Unrecoverable error — always logged. */
  error(tag: string, msg: string, err?: unknown): void {
    console.error(`[${tag}] ${msg}`, err ?? '');
    if (DSN && Sentry) {
      Sentry.captureException(err instanceof Error ? err : new Error(`[${tag}] ${msg}`));
    }
  },
};

/**
 * Safely parse a JSON string with a fallback value.
 * Logs a warning on parse failure instead of throwing.
 */
export function safeParse<T>(json: string | null | undefined, fallback: T, tag?: string): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (err) {
    logger.warn(tag ?? 'safeParse', 'JSON parse failed', err);
    return fallback;
  }
}
