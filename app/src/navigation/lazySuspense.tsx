/**
 * navigation/lazySuspense.tsx — Per-screen Suspense wrapper for React.lazy.
 *
 * Wraps each lazy-loaded screen in its own Suspense boundary so that
 * when a screen suspends during import, only that screen shows the
 * fallback — not the entire navigator. This prevents React Navigation
 * from losing its stack state during lazy loads.
 *
 * Usage:
 *   const MyScreen = lazySuspense(() => import('../screens/MyScreen'));
 *   <Stack.Screen name="My" component={MyScreen} />
 */

import React, { Suspense, type ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function SuspenseFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#bfa050" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

/**
 * Create a lazy-loaded component wrapped in its own Suspense boundary.
 * Drop-in replacement for React.lazy() in navigation stacks.
 */
export function lazySuspense<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(factory);

  const Wrapped: React.FC<React.ComponentProps<T>> = (props) => (
    <Suspense fallback={<SuspenseFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  // Preserve display name for debugging
  const name = factory.toString().match(/\/(\w+?)['"`]/)?.[1] ?? 'Lazy';
  Wrapped.displayName = `LazySuspense(${name})`;

  return Wrapped;
}
