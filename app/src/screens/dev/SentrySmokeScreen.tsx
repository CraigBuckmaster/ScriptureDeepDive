/**
 * screens/dev/SentrySmokeScreen.tsx — Dev-only harness for verifying
 * that Sentry events reach the dashboard with resolved source-mapped
 * stack traces.
 *
 * Gated by featureFlags.SENTRY_SMOKE_TEST + __DEV__. Never registered
 * in production builds.
 *
 * Minimal styling on purpose — this is an internal utility, not a
 * feature.
 */
import React, { useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import {
  captureException,
  addBreadcrumb,
  Sentry,
  DSN,
  getSentryInitStatus,
} from '../../lib/sentry';
import { logger } from '../../utils/logger';

export default function SentrySmokeScreen(): React.ReactElement {
  const dsnConfigured = Boolean(DSN);
  const sentryReady = Boolean(Sentry);
  const initStatus = getSentryInitStatus();

  const throwJsError = useCallback(() => {
    addBreadcrumb('User pressed throw-js-error', 'smoke-test');
    // Intentional: throws a synthetic error through the logger path
    // so we exercise the same codepath as production crashes.
    try {
      throw new Error('Sentry smoke test — synchronous throw');
    } catch (err) {
      logger.error('SentrySmoke', 'Synthetic JS error', err);
    }
    Alert.alert('Sent', 'JS error captured via logger.error.');
  }, []);

  const throwAsyncError = useCallback(() => {
    addBreadcrumb('User pressed throw-async-error', 'smoke-test');
    // Unhandled promise rejection — Sentry's global handler picks this up.
    setTimeout(() => {
      throw new Error('Sentry smoke test — async uncaught throw');
    }, 0);
    Alert.alert('Queued', 'Async throw scheduled. Check Sentry shortly.');
  }, []);

  const captureDirectly = useCallback(() => {
    addBreadcrumb('User pressed capture-directly', 'smoke-test');
    captureException(new Error('Sentry smoke test — direct capture'), {
      tags: { source: 'smoke-test' },
    });
    Alert.alert('Sent', 'Direct captureException called.');
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sentry Smoke Test</Text>

      <View style={styles.statusBlock}>
        <Text style={styles.statusLabel}>DSN configured:</Text>
        <Text style={dsnConfigured ? styles.statusOk : styles.statusBad}>
          {dsnConfigured ? 'yes' : 'NO — set extra.sentryDsn in app.json'}
        </Text>

        <Text style={styles.statusLabel}>Sentry module loaded:</Text>
        <Text style={sentryReady ? styles.statusOk : styles.statusBad}>
          {sentryReady ? 'yes' : 'NO — check @sentry/react-native install'}
        </Text>

        <Text style={styles.statusLabel}>Init status:</Text>
        <Text style={initStatus.state === 'initialized' ? styles.statusOk : styles.statusBad}>
          {initStatus.state === 'init-threw'
            ? `threw: ${initStatus.error}`
            : initStatus.state === 'module-shape-mismatch'
              ? `module shape mismatch (init was "${initStatus.initType}")`
              : initStatus.state}
        </Text>

        <Text style={styles.statusLabel}>Release:</Text>
        <Text style={styles.statusValue}>
          {`${Constants.expoConfig?.version ?? '?'} / ${Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? 'local'}`}
        </Text>

        <Text style={styles.statusLabel}>Environment:</Text>
        <Text style={styles.statusValue}>{__DEV__ ? 'development' : 'production'}</Text>
      </View>

      <Pressable style={styles.button} onPress={throwJsError}>
        <Text style={styles.buttonText}>Throw synchronous JS error</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={throwAsyncError}>
        <Text style={styles.buttonText}>Throw async (uncaught) error</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={captureDirectly}>
        <Text style={styles.buttonText}>captureException direct call</Text>
      </Pressable>

      <Text style={styles.hint}>
        After pressing a button, check the Sentry dashboard (Issues tab). Events
        typically appear within ~30s. A source-mapped stack trace resolving to
        this .tsx file confirms the EAS source-map upload worked. In Expo Go,
        stack traces will point at minified bundle — that&apos;s expected;
        only EAS builds upload source maps.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1a1710' },
  content: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#bfa050',
    marginBottom: 16,
  },
  statusBlock: {
    backgroundColor: '#252015',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 11,
    color: '#908878',
    marginTop: 6,
  },
  statusValue: { fontSize: 13, color: '#e8dcc8' },
  statusOk: { fontSize: 13, color: '#5cb85c' },
  statusBad: { fontSize: 13, color: '#e06050' },
  button: {
    backgroundColor: '#bfa050',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#1a1710',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#908878',
    marginTop: 16,
    lineHeight: 18,
  },
});
