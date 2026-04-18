/**
 * lib/sentry.ts — Crash reporting via Sentry.
 *
 * This is the ONLY module in the app that imports `@sentry/react-native`
 * directly. Everything else routes through `utils/logger.ts` (for errors
 * and warnings) or calls the helpers exported here (for manual capture,
 * user binding, and breadcrumbs).
 *
 * Why lazy-require? The package is a real dependency now, but keeping
 * the require defensive means the app still boots on machines where the
 * native module failed to link (e.g. a fresh clone where someone skipped
 * `npx expo prebuild`). In that case Sentry just stays inert.
 *
 * DSN handling: read from `Constants.expoConfig.extra.sentryDsn`. Empty
 * string or undefined means Sentry is disabled (useful for local dev if
 * you want to suppress event noise).
 */
import Constants from 'expo-constants';

type SentryModule = {
  init: (opts: Record<string, unknown>) => void;
  wrap: <T>(component: T) => T;
  captureException: (err: unknown, context?: Record<string, unknown>) => void;
  captureMessage: (msg: string, level?: string) => void;
  setUser: (user: { id: string } | null) => void;
  addBreadcrumb: (crumb: {
    message?: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
  }) => void;
};

const DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

const ENVIRONMENT = __DEV__ ? 'development' : 'production';

// Release string matches the source map upload — `version+buildNumber` —
// so stack traces resolve to source code in the Sentry dashboard.
const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
const IOS_BUILD = Constants.expoConfig?.ios?.buildNumber ?? '';
const ANDROID_BUILD = String(Constants.expoConfig?.android?.versionCode ?? '');
const BUILD_ID = IOS_BUILD || ANDROID_BUILD || 'local';
const RELEASE = `com.companionstudy.app@${APP_VERSION}+${BUILD_ID}`;

// ── PII / sensitive-data scrubbers ───────────────────────────────
// Runs on every event before it leaves the device. Belt-and-suspenders
// even with sendDefaultPii=false, because Sentry's defaults change over
// versions and we'd rather own the filter than audit the SDK.

const SENSITIVE_HEADER_KEYS = ['authorization', 'cookie', 'x-api-key', 'apikey'];

function scrubEvent(event: Record<string, unknown>): Record<string, unknown> {
  const user = event.user as Record<string, unknown> | undefined;
  if (user) {
    delete user.ip_address;
    delete user.email;
    delete user.username;
  }

  const request = event.request as Record<string, unknown> | undefined;
  if (request) {
    delete request.cookies;
    const headers = request.headers as Record<string, string> | undefined;
    if (headers) {
      for (const key of Object.keys(headers)) {
        if (SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())) {
          delete headers[key];
        }
      }
    }
  }

  return event;
}

function scrubBreadcrumb(crumb: Record<string, unknown>): Record<string, unknown> | null {
  // Strip request/response bodies from network breadcrumbs. URLs and
  // status codes remain — they're useful for debugging and low-risk.
  if (crumb.category === 'xhr' || crumb.category === 'fetch') {
    const data = crumb.data as Record<string, unknown> | undefined;
    if (data) {
      delete data.request_body;
      delete data.response_body;
    }
  }
  return crumb;
}

// ── Lazy load + init ─────────────────────────────────────────────

let _sentry: SentryModule | null = null;

try {
  if (DSN) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@sentry/react-native');
    if (typeof mod?.init === 'function') {
      _sentry = mod;
      _sentry!.init({
        dsn: DSN,
        environment: ENVIRONMENT,
        release: RELEASE,
        dist: BUILD_ID,
        enabled: true,
        // Errors only for now — performance tracing off until we know event volume.
        tracesSampleRate: 0,
        // Release-health sessions are free; keep them on for crash-free-user metrics.
        enableAutoSessionTracking: true,
        sendDefaultPii: false,
        attachStacktrace: true,
        beforeSend: (event: Record<string, unknown>) => scrubEvent(event),
        beforeBreadcrumb: (crumb: Record<string, unknown>) => scrubBreadcrumb(crumb),
      });
    }
  }
} catch {
  // @sentry/react-native failed to load (missing native module, etc.)
  // Sentry stays disabled — app boots normally.
}

// ── Public helpers ───────────────────────────────────────────────

/**
 * Bind an anonymous identifier to Sentry events so all crashes from a
 * single device roll up under one "user". Call once per app session
 * after the anonymous ID has been resolved from user.db.
 */
export function setSentryUser(anonymousId: string): void {
  if (_sentry) _sentry.setUser({ id: anonymousId });
}

/**
 * Manually capture an exception outside the logger flow. Prefer
 * `logger.error(...)` in app code — this is for the smoke test and
 * any future cases where richer context needs attaching.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (_sentry) _sentry.captureException(err, context);
}

/**
 * Add a manual breadcrumb. Useful for marking significant user
 * actions that precede a crash (e.g. "opened chapter", "switched
 * translation"). Auto-stripped of PII via beforeBreadcrumb.
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
): void {
  if (_sentry) _sentry.addBreadcrumb({ message, category, level: 'info', data });
}

export const Sentry = _sentry;
export { DSN };
