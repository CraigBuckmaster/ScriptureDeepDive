/**
 * ErrorBoundary — Catches rendering errors and shows a recovery screen.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { base, spacing, fontFamily } from '../theme';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
        <View style={{
          flex: 1, backgroundColor: base.bg, alignItems: 'center', justifyContent: 'center',
          padding: spacing.xl,
        }}>
          <Text style={{
            color: base.gold, fontFamily: fontFamily.displayMedium, fontSize: 18, textAlign: 'center',
          }}>
            Something went wrong
          </Text>
          <Text style={{
            color: base.textDim, fontFamily: fontFamily.body, fontSize: 14,
            textAlign: 'center', marginTop: spacing.md, lineHeight: 22,
          }}>
            {this.props.fallbackMessage ?? 'An unexpected error occurred. Please try again.'}
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={{ color: base.textMuted, fontSize: 10, marginTop: spacing.md, maxWidth: '90%' }}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity
            onPress={this.handleRetry}
            style={{
              marginTop: spacing.lg, backgroundColor: base.gold + '30',
              paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: base.gold, fontFamily: fontFamily.uiSemiBold, fontSize: 14 }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
