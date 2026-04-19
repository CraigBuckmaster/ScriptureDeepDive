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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { record: probeRecord, recordError: probeRecordError } = require('../utils/startupProbe');

let _sentry: SentryModule | null = null;

export type SentryInitStatus =
  | { state: 'disabled-no-dsn' }
  | { state: 'initialized' }
  | { state: 'module-shape-mismatch'; initType: string }
  | { state: 'init-threw'; error: string };

let _initStatus: SentryInitStatus = { state: 'disabled-no-dsn' };

probeRecord('sentry:module-loaded', `DSN=${DSN ? 'present' : 'missing'}`);

try {
  if (DSN) {
    probeRecord('sentry:entering-init-block');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@sentry/react-native');
    probeRecord(
      'sentry:require-succeeded',
      `init=${typeof mod?.init}, wrap=${typeof mod?.wrap}`,
    );
    if (typeof mod?.init === 'function') {
      _sentry = mod;
      probeRecord('sentry:calling-init');
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
      probeRecord('sentry:init-returned');
      _initStatus = { state: 'initialized' };
    } else {
      probeRecord('sentry:init-not-a-function');
      _initStatus = { state: 'module-shape-mismatch', initType: typeof mod?.init };
      // eslint-disable-next-line no-console
      console.warn('[sentry] @sentry/react-native loaded but .init is not a function:', typeof mod?.init);
    }
  } else {
    probeRecord('sentry:skipped-no-dsn');
  }
} catch (err) {
  _initStatus = {
    state: 'init-threw',
    error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
  };
  probeRecordError('sentry:init-threw', err);
  // Surfaces in device logs (Xcode console, Console.app, Metro). Previously
  // this catch was silent, which hid native-module link failures and any
  // unexpected option rejections in @sentry/react-native init.
  // eslint-disable-next-line no-console
  console.warn('[sentry] init failed:', err);
}

/**
 * Returns why Sentry is/isn't active. The smoke test screen surfaces this
 * so we don't have to guess at why events aren't landing in the dashboard.
 */
export function getSentryInitStatus(): SentryInitStatus {
  return _initStatus;
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
