/**
 * utils/startupProbe.ts — Persistent startup milestone logger.
 *
 * Writes a sequence of timestamped markers to
 * `Documents/startup-probe-current.json` during app launch. Each
 * call serialises the full accumulated log so a crash between two
 * probe points always leaves the file at the correct state.
 *
 * At startup the prior session's current file is rotated to
 * `startup-probe-previous.json`. If the app survives for
 * {@link STABILITY_WINDOW_MS} after UI mount, the current file is
 * deleted — treating stable runtime as "launch succeeded". That
 * means on the next boot, if `previous` exists, last session
 * crashed and {@link PreviousProbeBanner} will render it.
 *
 * Purpose: build 15 / 16 / 18 TestFlight binaries crash ~15 s after
 * launch with a signature that tells us WHICH terminate path fires
 * (RCTFatal via RCTExceptionsManager → void TurboModule NSException)
 * but not WHICH line of JS is throwing. Sentry isn't transmitting
 * from the production binary for reasons we haven't pinned down, so
 * we need an on-device signal that doesn't depend on the network
 * or on any React-Native error boundary completing gracefully.
 *
 * Design constraints:
 *   - Must survive a hard `abort(3)` → full JSON rewrite on every
 *     call, not an append stream.
 *   - Must not itself crash the app → writes go through the
 *     small-string File#write path (≤ a few KB), which is distinct
 *     from the large-Uint8Array path implicated in the crash.
 *   - Must be synchronous during record() → a crash between probe
 *     N and N+1 leaves the file at probe N.
 *   - Must not require any new native module → only uses the File
 *     API from expo-file-system that the app already depends on.
 *
 * Remove this module (and its call sites) once the startup crash
 * is diagnosed and fixed.
 */

import { File, Paths } from 'expo-file-system';

const CURRENT_FILENAME = 'startup-probe-current.json';
const PREVIOUS_FILENAME = 'startup-probe-previous.json';
const PROBE_VERSION = 1;
export const STABILITY_WINDOW_MS = 5000;

interface ProbeEntry {
  /** Milliseconds since app start (based on the first record() in this session). */
  elapsedMs: number;
  /** Short tag identifying the milestone. */
  tag: string;
  /** Optional free-form detail, clamped to 500 chars. */
  detail?: string;
}

export interface ProbeFile {
  version: number;
  /** Unix epoch ms when this session's first record() fired. */
  sessionStart: number;
  /** Recorded milestones in order. */
  entries: ProbeEntry[];
}

let sessionStart: number | null = null;
let entries: ProbeEntry[] = [];

function currentFile(): File {
  return new File(Paths.document, CURRENT_FILENAME);
}

function previousFile(): File {
  return new File(Paths.document, PREVIOUS_FILENAME);
}

/**
 * Rotate the prior session's current file into the previous slot.
 * Call once, as early as possible in app startup, before any
 * other probe call. Safe to call multiple times (idempotent for
 * this launch — only does work the first time the file exists).
 */
export function rotate(): void {
  try {
    const current = currentFile();
    if (!current.exists) return;
    const previous = previousFile();
    if (previous.exists) {
      try { previous.delete(); } catch { /* ignore */ }
    }
    current.move(previous);
  } catch {
    /* non-fatal — probe is a diagnostic, not a feature */
  }
}

/**
 * Record a startup milestone. Writes the full accumulated log to
 * disk synchronously. Never throws.
 */
export function record(tag: string, detail?: string): void {
  try {
    const now = Date.now();
    if (sessionStart === null) {
      sessionStart = now;
    }

    const trimmedDetail =
      detail === undefined ? undefined : String(detail).slice(0, 500);

    entries.push({
      elapsedMs: now - sessionStart,
      tag,
      detail: trimmedDetail,
    });

    const payload: ProbeFile = {
      version: PROBE_VERSION,
      sessionStart,
      entries,
    };
    const file = currentFile();
    file.create({ overwrite: true });
    file.write(JSON.stringify(payload));
  } catch {
    /* non-fatal */
  }
}

/**
 * Record a caught exception with its message and the first couple
 * of lines of its stack. Inlining this at every catch site would
 * bloat the surgical call sites.
 */
export function recordError(tag: string, err: unknown): void {
  if (err instanceof Error) {
    const firstStackLine = (err.stack ?? '').split('\n').slice(0, 2).join(' | ');
    record(tag, `${err.message} :: ${firstStackLine}`);
  } else {
    record(tag, String(err));
  }
}

/**
 * Read the previous-session probe file. Returns null if the file
 * is missing, a parsed object if the contents are valid JSON, or
 * the raw string if parsing failed (we'd rather show raw bytes
 * than lose diagnostic data).
 */
export async function readPreviousProbeAsync(): Promise<
  ProbeFile | string | null
> {
  try {
    const file = previousFile();
    if (!file.exists) return null;
    const bytes = await file.bytes();
    const text = new TextDecoder('utf-8').decode(bytes);
    try {
      return JSON.parse(text) as ProbeFile;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

/**
 * Delete the previous-session probe. Call after the user has
 * acknowledged viewing it, so subsequent launches don't keep
 * showing the same banner.
 */
export function dismissPrevious(): void {
  try {
    const file = previousFile();
    if (file.exists) file.delete();
  } catch {
    /* non-fatal */
  }
}

/**
 * Declare the current launch stable — delete the current-session
 * file so the next launch won't mistake it for a crash report.
 * Safe to call multiple times.
 */
export function markLaunchStable(): void {
  try {
    const file = currentFile();
    if (file.exists) file.delete();
  } catch {
    /* non-fatal */
  }
  entries = [];
  sessionStart = null;
}
