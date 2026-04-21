/**
 * DbDownloadScreen — First-launch full-screen download UI.
 *
 * Shown by App.tsx when initDatabase() reports 'needs_download' (no DB on
 * device, or DB file is too small to be valid). Drives ContentUpdater to
 * fetch the full scripture.db from R2.
 *
 * Calls onComplete() after a successful download so the parent can
 * transition to the normal app tree. `onComplete` may return a Promise —
 * we await it so that any post-download work performed by the parent
 * (e.g. opening the freshly-downloaded DB) can surface thrown errors
 * through this screen's existing error UI instead of becoming an
 * unhandled promise rejection.
 *
 * ── UI states during download ─────────────────────────────────────────
 *
 * The download mechanism in `ContentUpdater.downloadFullDb` cannot emit
 * smooth progress events for the large-file path (≥ 25 MB). The new
 * `expo-file-system` `File.downloadFileAsync` API does not yet expose an
 * `onProgress` callback in the SDK 54 release line we ship on, and the
 * legacy `expo-file-system/legacy` `createDownloadResumable` shim crashes
 * on download completion under the New Architecture (see comment block at
 * the top of `ContentUpdater.ts`). For the typical Companion Study DB
 * payload (~94 MB) the callback fires 5% → silence → 100%, which made
 * earlier builds appear frozen at 5%.
 *
 * To avoid the misleading "stuck progress bar" UX without restoring a
 * crash-prone download mechanism, this screen detects when the progress
 * callback has gone silent for more than {@link STALL_DETECTION_MS} and
 * switches to an indeterminate UI: large spinner, total payload size,
 * helper copy, elapsed-time counter. As soon as a real progress event
 * fires, it switches back to the percentage bar — so smaller updates
 * (delta SQL patches, future `onProgress`-aware download APIs) still get
 * the smooth-bar treatment automatically.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ContentUpdater } from '../services/ContentUpdater';
import { fontFamily, spacing, useTheme } from '../theme';

interface Props {
  /**
   * Called after a successful download. May return a Promise; if it
   * throws or rejects, the download screen shows the error and offers
   * Retry rather than silently transitioning to a broken app tree.
   */
  onComplete: () => void | Promise<void>;
}

/**
 * Time without a progress callback after which we treat the download as
 * "indeterminate" and swap to the spinner UI. Long enough that a slow
 * download still trickling in chunks doesn't flicker, short enough that a
 * truly silent path (the large-file branch in ContentUpdater) flips over
 * within a beat or two.
 */
const STALL_DETECTION_MS = 2000;

/** How often the elapsed-time + stall-detection timer ticks. */
const TICK_INTERVAL_MS = 250;

function formatBytes(bytes: number | null): string | null {
  if (bytes == null) return null;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function DbDownloadScreen({ onComplete }: Props) {
  const { base } = useTheme();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  /**
   * True when the most recent progress callback fired within
   * {@link STALL_DETECTION_MS}. When true we show the % bar; when false
   * we show the indeterminate spinner UI. Defaults to false so the very
   * first few hundred ms — before any callback — render as indeterminate.
   */
  const [progressIsLive, setProgressIsLive] = useState(false);

  const downloadStartRef = useRef<number | null>(null);
  const lastProgressUpdateRef = useRef<number | null>(null);

  const startDownload = useCallback(async () => {
    setStatus('downloading');
    setError(null);
    setProgress(0);
    setProgressIsLive(false);
    setElapsedSec(0);
    downloadStartRef.current = Date.now();
    lastProgressUpdateRef.current = null;

    try {
      const manifest = await ContentUpdater.fetchManifest();
      setSizeBytes(manifest.full_db_size_bytes);

      const result = await ContentUpdater.downloadFullDb(manifest, (pct) => {
        setProgress(pct);
        lastProgressUpdateRef.current = Date.now();
      });

      if (result.status === 'updated') {
        // Await onComplete so a post-download init failure surfaces here
        // instead of becoming an unhandled rejection.
        try {
          await onComplete();
        } catch (completeErr) {
          setStatus('error');
          setError(
            completeErr instanceof Error
              ? `Post-download setup failed: ${completeErr.message}`
              : `Post-download setup failed: ${String(completeErr)}`,
          );
        }
        return;
      }

      setStatus('error');
      setError(result.error ?? 'Download failed. Please try again.');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [onComplete]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startDownload();
  }, [startDownload]);

  // Tick: update elapsed seconds + recompute "is progress live" flag.
  // Only runs while a download is in flight.
  useEffect(() => {
    if (status !== 'downloading') return;

    const interval = setInterval(() => {
      const now = Date.now();

      if (downloadStartRef.current != null) {
        setElapsedSec(Math.floor((now - downloadStartRef.current) / 1000));
      }

      const lastUpdate = lastProgressUpdateRef.current;
      // "Live" only when we've actually seen a callback recently AND
      // progress is somewhere in the middle. At 0 we haven't started; at
      // 100 we're handing off to onComplete and the bar hitting full
      // immediately after a long indeterminate stretch is jarring.
      const sinceLastUpdate = lastUpdate == null ? Infinity : now - lastUpdate;
      const isLive =
        sinceLastUpdate < STALL_DETECTION_MS && progress > 0 && progress < 100;
      setProgressIsLive(isLive);
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status, progress]);

  const sizeText = formatBytes(sizeBytes);
  const clampedPct = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: base.gold }]}>Companion Study</Text>
        <Text style={[styles.subtitle, { color: base.textDim }]}>
          Setting up your library…
        </Text>

        {status === 'downloading' && progressIsLive && (
          <>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: base.bgElevated, borderColor: base.border },
              ]}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedPct) }}
            >
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: base.gold, width: `${clampedPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: base.text }]}>
              {clampedPct.toFixed(0)}%
              {sizeText ? ` • ${sizeText}` : ''}
            </Text>
          </>
        )}

        {status === 'downloading' && !progressIsLive && (
          <View
            style={styles.indeterminateBlock}
            accessibilityRole="progressbar"
            accessibilityLabel="Downloading scripture content"
          >
            <ActivityIndicator
              color={base.gold}
              size="large"
              style={styles.spinnerLarge}
            />
            <Text style={[styles.indetTitle, { color: base.text }]}>
              Downloading scripture content
            </Text>
            {sizeText != null && (
              <Text style={[styles.indetSize, { color: base.textDim }]}>{sizeText}</Text>
            )}
            <Text style={[styles.indetHelp, { color: base.textMuted }]}>
              This may take a minute on slower connections.{'\n'}
              Please don&rsquo;t close the app.
            </Text>
            <Text style={[styles.elapsed, { color: base.textMuted }]}>
              Elapsed {formatElapsed(elapsedSec)}
            </Text>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.errorBlock}>
            <Text style={[styles.errorText, { color: base.danger }]}>
              {error ?? 'Something went wrong.'}
            </Text>
            <TouchableOpacity
              onPress={startDownload}
              accessibilityRole="button"
              accessibilityLabel="Retry download"
              style={[styles.retryButton, { borderColor: base.gold }]}
            >
              <Text style={[styles.retryText, { color: base.gold }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default DbDownloadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 28,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  indeterminateBlock: {
    width: '100%',
    alignItems: 'center',
  },
  spinnerLarge: {
    marginBottom: spacing.lg,
    transform: [{ scale: 1.4 }],
  },
  indetTitle: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 16,
    textAlign: 'center',
  },
  indetSize: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  indetHelp: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  elapsed: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  errorBlock: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  errorText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
