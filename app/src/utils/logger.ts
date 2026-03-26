/**
 * utils/logger.ts — Centralized logging utility.
 *
 * Replaces bare console.log/warn/error calls with tagged, gated output.
 * - info: only in __DEV__ (stripped from production)
 * - warn: always logged (user-facing issues, recoverable errors)
 * - error: always logged (crashes, data corruption, unrecoverable)
 *
 * Future: swap the warn/error implementations for Sentry, Bugsnag, etc.
 * without touching any call sites.
 */

const IS_DEV = __DEV__;

export const logger = {
  /** Debug/trace info — suppressed in production. */
  info(tag: string, msg: string, data?: unknown): void {
    if (IS_DEV) console.log(`[${tag}] ${msg}`, data ?? '');
  },

  /** Recoverable issue — always logged. */
  warn(tag: string, msg: string, data?: unknown): void {
    console.warn(`[${tag}] ${msg}`, data ?? '');
    // Future: Sentry.captureMessage(...)
  },

  /** Unrecoverable error — always logged. */
  error(tag: string, msg: string, err?: unknown): void {
    console.error(`[${tag}] ${msg}`, err ?? '');
    // Future: Sentry.captureException(...)
  },
};
