/**
 * DbDownloadScreen — First-launch full-screen download UI.
 *
 * Shown by App.tsx when initDatabase() reports 'needs_download' (no DB on
 * device, or DB file is too small to be valid). Drives ContentUpdater to
 * fetch the full scripture.db from R2, showing progress + error states.
 *
 * Calls onComplete() after a successful download so the parent can
 * transition to the normal app tree.
 */

import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { useTheme, spacing, fontFamily } from '../theme';
import { ContentUpdater } from '../services/ContentUpdater';

interface Props {
  onComplete: () => void;
}

export function DbDownloadScreen({ onComplete }: Props) {
  const { base } = useTheme();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sizeBytes, setSizeBytes] = useState<number | null>(null);

  const startDownload = useCallback(async () => {
    setStatus('downloading');
    setError(null);
    setProgress(0);

    try {
      const manifest = await ContentUpdater.fetchManifest();
      setSizeBytes(manifest.full_db_size_bytes);

      const result = await ContentUpdater.downloadFullDb(manifest, (pct) => {
        setProgress(pct);
      });

      if (result.status === 'updated') {
        onComplete();
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
    startDownload();
  }, [startDownload]);

  const clampedPct = Math.max(0, Math.min(100, progress));
  const sizeMb = sizeBytes ? (sizeBytes / 1024 / 1024).toFixed(1) : null;

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: base.gold }]}>Companion Study</Text>
        <Text style={[styles.subtitle, { color: base.textDim }]}>Setting up your library…</Text>

        {status === 'downloading' && (
          <>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: base.bgElevated, borderColor: base.border },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: '#bfa050', width: `${clampedPct}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: base.text }]}>
              {clampedPct.toFixed(0)}%
              {sizeMb ? ` • ${sizeMb} MB` : ''}
            </Text>
            {clampedPct === 0 && <ActivityIndicator color={base.gold} style={styles.spinner} />}
          </>
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
  spinner: {
    marginTop: spacing.md,
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
