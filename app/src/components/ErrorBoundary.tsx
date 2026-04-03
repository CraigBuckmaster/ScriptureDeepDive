/**
 * ErrorBoundary — Catches rendering errors and shows a recovery screen.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error, fallbackMessage, onRetry }: {
  error: Error | null;
  fallbackMessage?: string;
  onRetry: () => void;
}) {
  const { base } = useTheme();

  return (
    <View style={[styles.fallbackContainer, { backgroundColor: base.bg }]}>
      <Text style={[styles.fallbackTitle, { color: base.gold }]}>
        Something went wrong
      </Text>
      <Text style={[styles.fallbackMessage, { color: base.textDim }]}>
        {fallbackMessage ?? 'An unexpected error occurred. Please try again.'}
      </Text>
      {__DEV__ && error && (
        <Text style={[styles.fallbackError, { color: base.textMuted }]}>
          {error.message}
        </Text>
      )}
      <TouchableOpacity
        onPress={onRetry}
        style={[styles.retryButton, { backgroundColor: base.gold + '30' }]}
      >
        <Text style={[styles.retryButtonText, { color: base.gold }]}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary', error.message, { error, componentStack: info.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          fallbackMessage={this.props.fallbackMessage}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fallbackTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    textAlign: 'center',
  },
  fallbackMessage: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
  },
  fallbackError: {
    fontSize: 10,
    marginTop: spacing.md,
    maxWidth: '90%',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 14,
  },
});
