/**
 * components/PreviousProbeGate.tsx — First-render gate that shows
 * the previous session's startup-probe log if one exists.
 *
 * Rendered at the very top of App.tsx, before any data init work
 * begins. If the user's last launch crashed, its probe file still
 * exists; we render its contents full-screen with a Continue
 * button. When the user taps Continue, the probe is dismissed and
 * the real app init proceeds.
 *
 * If no previous probe exists, this component renders its children
 * directly — no visible UI, no delay.
 *
 * Why top-level? The crash we're diagnosing fires ~15s into
 * launch, well after useEffect hooks mount. Pushing the display
 * as early as possible in the render tree ensures the probe is
 * visible before any of the code paths that might crash have
 * a chance to run.
 *
 * Remove this component (and its App.tsx mount point) once the
 * startup crash is diagnosed and fixed.
 */

import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  dismissPrevious,
  readPreviousProbeAsync,
  type ProbeFile,
} from '../utils/startupProbe';

interface Props {
  children: ReactNode;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'no-previous' }
  | { kind: 'has-previous'; contents: string };

export function PreviousProbeGate({ children }: Props): React.ReactElement {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    readPreviousProbeAsync().then((result) => {
      if (cancelled) return;
      if (result === null) {
        setState({ kind: 'no-previous' });
        return;
      }
      const contents =
        typeof result === 'string'
          ? result
          : formatProbeFile(result);
      setState({ kind: 'has-previous', contents });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#bfa050" size="small" />
      </View>
    );
  }

  if (state.kind === 'no-previous') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previous Launch Probe</Text>
      <Text style={styles.subtitle}>
        The last launch did not complete cleanly. The probe below
        shows the startup milestones it reached before stopping.
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.code} selectable>
          {state.contents}
        </Text>
      </ScrollView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          dismissPrevious();
          setState({ kind: 'no-previous' });
        }}
        accessibilityRole="button"
        accessibilityLabel="Dismiss probe and continue"
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatProbeFile(probe: ProbeFile): string {
  const header = [
    `Session started: ${new Date(probe.sessionStart).toISOString()}`,
    `Probe version: ${probe.version}`,
    `Entries: ${probe.entries.length}`,
    '',
    '── Milestones ──',
  ].join('\n');

  const body = probe.entries
    .map((e) => {
      const elapsed = `+${e.elapsedMs.toString().padStart(5, ' ')}ms`;
      const detail = e.detail ? `\n    ${e.detail}` : '';
      return `${elapsed}  ${e.tag}${detail}`;
    })
    .join('\n');

  return `${header}\n${body}`;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c0a07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0c0a07',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: '#bfa050',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#b8a888',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#1a1510',
    borderColor: '#3d3528',
    borderWidth: 1,
    borderRadius: 6,
  },
  scrollContent: {
    padding: 12,
  },
  code: {
    color: '#d4c9b0',
    fontFamily: 'Menlo',
    fontSize: 11,
    lineHeight: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#bfa050',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0c0a07',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
