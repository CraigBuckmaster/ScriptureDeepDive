/**
 * utils/crashHandler.ts — Global JS error capture for the startup
 * crash investigation.
 *
 * Build 1.0.7(15), (16), (18) all crashed ~15s after launch on
 * iOS TestFlight. The native crash log shows the terminate path
 * (RCTFatal → RCTExceptionsManager.reportException → void
 * TurboModule NSException → abort) but NOT the originating JS
 * error. Sentry is installed but has transmitted zero events from
 * production iOS across every crashing build.
 *
 * PR #1525's startup-probe approach failed — it gated the render
 * tree and produced a worse symptom (silent black screen, no crash
 * log) than the crash it was trying to diagnose.
 *
 * This module takes a different approach: hook React Native's
 * ErrorUtils.setGlobalHandler, capture JS errors upstream of
 * ExceptionsManager, and write a tiny JSON blob to disk
 * synchronously. On next launch we display it via native
 * Alert.alert — no render-tree wrapping, no async-before-paint,
 * no new component gates.
 *
 * Chain design:
 *   JS throws an error somewhere in the app
 *     ↓
 *   ErrorUtils.globalHandler fires (that's us)
 *     ↓
 *   We write Documents/last-js-error.json (sync, small)
 *     ↓
 *   We call the prior handler (RN default, which reports to
 *     ExceptionsManager → which is what eventually crashes)
 *
 * By the time the NSException fires in native and the process
 * dies, our file is already on disk.
 *
 * Remove once the startup crash is diagnosed and fixed.
 */

import { Alert } from 'react-native';
import { File, Paths } from 'expo-file-system';

const FILENAME = 'last-js-error.json';
const PAYLOAD_VERSION = 1;

interface CrashPayload {
  version: number;
  timestamp: string;
  message: string;
  stack: string;
  isFatal: boolean;
  /** The error's constructor name, when available. */
  name?: string;
}

function crashFile(): File {
  return new File(Paths.document, FILENAME);
}

/**
 * Write the crash payload to disk synchronously. Wrapped in
 * try/catch so if disk I/O itself throws inside an error handler,
 * we don't compound the problem by throwing from the handler.
 */
function writeCrashSync(payload: CrashPayload): void {
  try {
    const file = crashFile();
    file.create({ overwrite: true });
    file.write(JSON.stringify(payload));
  } catch {
    // The handler must never be the thing that crashes.
  }
}

/**
 * Install the global JS error handler. Call once from index.ts at
 * the very top — before any other user code runs. `global.ErrorUtils`
 * is installed by React Native's JS bootstrap before module
 * resolution begins, so it's safe to reference here.
 *
 * Chains to whatever handler was installed before us (usually
 * React Native's default, which reports via ExceptionsManager).
 * If Sentry ever initializes successfully, its handler runs too
 * via the same chain — we do not break that path.
 */
export function installCrashHandler(): void {
  try {
    const errorUtils = (global as unknown as {
      ErrorUtils?: {
        getGlobalHandler: () => (error: unknown, isFatal?: boolean) => void;
        setGlobalHandler: (
          cb: (error: unknown, isFatal?: boolean) => void,
        ) => void;
      };
    }).ErrorUtils;

    if (!errorUtils) return;

    const priorHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
      try {
        const err = error as { message?: string; stack?: string; name?: string };
        writeCrashSync({
          version: PAYLOAD_VERSION,
          timestamp: new Date().toISOString(),
          message: typeof err?.message === 'string' ? err.message : String(error),
          stack: typeof err?.stack === 'string' ? err.stack.slice(0, 4000) : '',
          isFatal: isFatal === true,
          name: typeof err?.name === 'string' ? err.name : undefined,
        });
      } catch {
        // Never throw from here.
      }

      // Preserve the existing handler chain. Without this, React
      // Native's red-box / ExceptionsManager reporting (and any
      // Sentry hook that installs after us) would be broken.
      if (priorHandler) {
        try {
          priorHandler(error, isFatal);
        } catch {
          // If the prior handler itself throws, there is nothing
          // meaningful we can do here.
        }
      }
    });
  } catch {
    // Installing the handler failed — nothing to do. The app
    // continues to run with whatever handler was already in place.
  }
}

/**
 * Read the last-crash file if one exists. Returns null if the file
 * is missing or unreadable. Does NOT delete the file — call
 * {@link dismissLastCrash} once the user has acknowledged the
 * Alert.
 */
async function readLastCrashAsync(): Promise<CrashPayload | null> {
  try {
    const file = crashFile();
    if (!file.exists) return null;
    const bytes = await file.bytes();
    const text = new TextDecoder('utf-8').decode(bytes);
    const parsed = JSON.parse(text) as CrashPayload;
    if (typeof parsed?.message !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function dismissLastCrash(): void {
  try {
    const file = crashFile();
    if (file.exists) file.delete();
  } catch {
    /* non-fatal */
  }
}

/**
 * If a crash from the previous launch was captured, show it in a
 * native Alert. Safe to call from anywhere, any time — fire and
 * forget, does not block the caller. No-op if no file is present.
 *
 * Called from App.tsx's init useEffect so it runs in parallel with
 * the normal boot sequence rather than gating any render path.
 */
export function displayLastCrashIfAny(): void {
  readLastCrashAsync().then((crash) => {
    if (!crash) return;
    const stackPreview = crash.stack
      ? `\n\n${crash.stack.split('\n').slice(0, 6).join('\n')}`
      : '';
    const title = crash.isFatal
      ? 'Previous launch crashed'
      : 'Previous launch reported an error';
    const body =
      `${crash.name ?? 'Error'}: ${crash.message}` +
      `\n\nAt ${crash.timestamp}` +
      stackPreview;
    Alert.alert(title, body, [
      { text: 'Dismiss', onPress: dismissLastCrash },
    ]);
  });
}
