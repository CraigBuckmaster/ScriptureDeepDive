/**
 * ScreenErrorBoundary — Screen-level error boundary with Go Back + Try Again.
 *
 * Usage:
 *   export default withErrorBoundary(MyScreen);
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { logger } from '../utils/logger';

// ── Types ───────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ── Fallback UI (functional, so it can use hooks) ───────────────────

function ScreenFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { base } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: base.bg }]}>
      <Text style={[styles.title, { color: base.gold }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: base.textDim }]}>
        This screen ran into an unexpected error. You can go back or try again.
      </Text>
      {__DEV__ && error && (
        <Text style={[styles.devError, { color: base.textMuted }]} numberOfLines={6}>
          {error.message}
        </Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
          }}
          style={[styles.button, { backgroundColor: base.card }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: base.text }]}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.button, { backgroundColor: base.gold + '30' }]}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: base.gold }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Error boundary class ────────────────────────────────────────────

export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ScreenErrorBoundary', error.message, {
      error,
      componentStack: info.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ScreenFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// ── HOC wrapper ─────────────────────────────────────────────────────

export function withErrorBoundary<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithScreenErrorBoundary(props: P) {
    return (
      <ScreenErrorBoundary>
        <WrappedComponent {...props} />
      </ScreenErrorBoundary>
    );
  }

  WithScreenErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return WithScreenErrorBoundary;
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  devError: {
    fontSize: 10,
    marginTop: spacing.md,
    maxWidth: '90%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
