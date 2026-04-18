/**
 * constants/featureFlags.ts — Central feature-flag registry.
 *
 * Flags here are resolved at bundle time from `process.env` (Expo inlines
 * EXPO_PUBLIC_* vars). Default values are always the production-safe side
 * so a misconfigured build never leaks a dev-only feature.
 */

function isDev(): boolean {
  // `__DEV__` is a React Native / Expo global. Typecheck without pulling in
  // RN types at this module level.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  return Boolean((globalThis as any).__DEV__);
}

export const featureFlags = {
  /**
   * Amicus E2E smoke test screen (Card #1453). Dev-only by construction —
   * only visible when `__DEV__` is true AND `EXPO_PUBLIC_AMICUS_SMOKE=true`.
   */
  AMICUS_SMOKE_TEST:
    isDev() && process.env.EXPO_PUBLIC_AMICUS_SMOKE === 'true',

  /**
   * Sentry smoke-test screen — triggers synthetic errors so we can verify
   * events land in Sentry with resolved stack traces. Dev-only by
   * construction — only visible when `__DEV__` is true AND
   * `EXPO_PUBLIC_SENTRY_SMOKE=true`.
   */
  SENTRY_SMOKE_TEST:
    isDev() && process.env.EXPO_PUBLIC_SENTRY_SMOKE === 'true',
} as const;

export type FeatureFlag = keyof typeof featureFlags;
