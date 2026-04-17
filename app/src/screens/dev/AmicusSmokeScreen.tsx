/**
 * screens/dev/AmicusSmokeScreen.tsx — Dev-only harness UI for the Amicus
 * smoke test (Card #1453). Guarded by featureFlags.AMICUS_SMOKE_TEST; never
 * registered in production builds.
 *
 * Minimal styling on purpose — this is an internal utility, not a feature.
 */
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { logger } from '@/utils/logger';
import {
  runSmokeTest,
  type QueryResult,
  type SmokeReport,
} from '@/services/amicus/__smoke__/runSmokeTest';

export default function AmicusSmokeScreen(): React.ReactElement {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ index: number; total: number } | null>(null);
  const [report, setReport] = useState<SmokeReport | null>(null);
  const [authToken] = useState<string>(
    process.env.EXPO_PUBLIC_AMICUS_DEV_TOKEN ?? '',
  );

  const run = useCallback(async () => {
    if (!authToken) {
      Alert.alert(
        'Missing auth token',
        'Set EXPO_PUBLIC_AMICUS_DEV_TOKEN in your dev env or paste a RevenueCat receipt.',
      );
      return;
    }
    setRunning(true);
    setReport(null);
    setProgress({ index: 0, total: 10 });
    try {
      const r = await runSmokeTest({
        authToken,
        onProgress: (i) => setProgress({ index: i + 1, total: 10 }),
      });
      setReport(r);
    } catch (err) {
      logger.error('Amicus', 'smoke test crashed', err);
      Alert.alert('Smoke test failed', (err as Error).message);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }, [authToken]);

  const copyReport = useCallback(async () => {
    if (!report) return;
    await Clipboard.setStringAsync(JSON.stringify(report, null, 2));
    Alert.alert('Report copied', 'JSON copied to clipboard.');
  }, [report]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Amicus Smoke Test (Dev Only)</Text>
      <Text style={styles.subtle}>
        Runs 10 canned queries through the full Phase 1 pipeline. Dev-only
        screen; not visible in production.
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Auth token (RevenueCat receipt)</Text>
        <Text numberOfLines={1} style={styles.mono}>
          {authToken ? `${authToken.slice(0, 10)}…` : '(unset)'}
        </Text>
      </View>

      <Pressable
        onPress={run}
        disabled={running}
        style={[styles.button, running && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {running ? 'Running…' : 'Run all 10 queries'}
        </Text>
      </Pressable>

      {progress && (
        <View style={styles.progress}>
          <ActivityIndicator />
          <Text style={styles.subtle}>
            {progress.index} / {progress.total}
          </Text>
        </View>
      )}

      {report && (
        <View style={styles.reportBox}>
          <Text style={styles.header}>
            {report.passed} / {report.total} passed · p95 {report.latency_ms_p95}ms
          </Text>
          <Pressable onPress={copyReport} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Copy JSON report</Text>
          </Pressable>
          {report.results.map((r) => (
            <ResultRow key={r.query_id} result={r} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ResultRow({ result }: { result: QueryResult }): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const marker = result.passed ? '✓' : '✗';
  return (
    <Pressable onPress={() => setExpanded((x) => !x)} style={styles.resultRow}>
      <Text style={[styles.resultTitle, !result.passed && styles.resultFail]}>
        {marker} {result.query_id} — {result.query}
      </Text>
      <Text style={styles.subtle}>
        {result.latency_ms}ms · in {result.tokens_in} · out {result.tokens_out}
        {result.gap_signal?.gap ? ' · gap' : ''}
      </Text>
      {expanded && (
        <View style={styles.details}>
          {result.failures.length > 0 && (
            <Text style={styles.resultFail}>Failures:</Text>
          )}
          {result.failures.map((f, i) => (
            <Text key={i} style={styles.resultFail}>
              • {f}
            </Text>
          ))}
          <Text style={styles.subtle}>Citations:</Text>
          {result.citations.length === 0 ? (
            <Text style={styles.subtle}>  (none)</Text>
          ) : (
            result.citations.map((c) => (
              <Text key={c} style={styles.mono}>
                {'  '}{c}
              </Text>
            ))
          )}
          <Text style={styles.subtle}>Preview:</Text>
          <Text style={styles.mono}>{result.raw_response_preview}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  subtle: { color: '#666', fontSize: 12, marginVertical: 2 },
  row: { marginBottom: 12 },
  label: { fontSize: 13, marginBottom: 4 },
  mono: { fontFamily: 'Courier', fontSize: 11 },
  button: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 15 },
  secondaryButton: {
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#333', fontSize: 13 },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  reportBox: { marginTop: 16 },
  resultRow: {
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  resultTitle: { fontSize: 13, marginBottom: 2 },
  resultFail: { color: '#c00' },
  details: { marginTop: 6, paddingLeft: 8 },
});
