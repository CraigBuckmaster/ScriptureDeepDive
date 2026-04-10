/**
 * lib/sentry.ts — Crash reporting via Sentry (conditional).
 *
 * The @sentry/react-native package is NOT installed until Craig creates
 * the Sentry project and runs `npx expo install @sentry/react-native`.
 * All access is deferred via try/require so the app works without it.
 */
import Constants from 'expo-constants';

const DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

// Lazy-load Sentry — returns a no-op stub if the package isn't installed or no DSN
let _sentry: {
  init: (opts: Record<string, unknown>) => void;
  wrap: <T>(component: T) => T;
  captureException: (err: unknown) => void;
  captureMessage: (msg: string, level?: string) => void;
  setUser: (user: { id: string } | null) => void;
} | null = null;

try {
  if (DSN) {
    _sentry = require('@sentry/react-native');
    _sentry!.init({
      dsn: DSN,
      enableAutoSessionTracking: true,
      tracesSampleRate: 0.2,
    });
  }
} catch {
  // @sentry/react-native not installed — Sentry disabled
}

export const Sentry = _sentry;
export { DSN };
