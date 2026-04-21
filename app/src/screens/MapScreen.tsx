/**
 * MapScreen — MapLibre-aware dispatcher.
 *
 * The REAL implementation lives in MapScreenNative.tsx. It imports
 * `@maplibre/maplibre-react-native`, whose MapView module runs
 * `requireNativeComponent('MLRNMapView')` at load time. That call throws
 * an Invariant Violation in Expo Go (no MapLibre native binary), so we
 * must keep the MapLibre import out of the module graph entirely when
 * the native side isn't available.
 *
 * React.lazy defers the factory until render time, so the dynamic
 * `import('./MapScreenNative')` only evaluates when we decide to render
 * it — otherwise we render the MapUnavailableCard and MapLibre's module
 * body never runs.
 *
 * Also exports the pure helpers that unit tests rely on, re-exported
 * from MapScreenNative via a dynamic import boundary that never executes
 * at load time.
 */

import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { isMapNativeAvailable, getMapUnavailableReason } from '../utils/isMapNativeAvailable';
import { MapUnavailableCard } from '../components/map/MapUnavailableCard';
import { MapErrorBoundary } from '../components/map/MapErrorBoundary';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import { useTheme } from '../theme';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';

// Re-export the R2 style URLs so any existing `import { STYLE_ANCIENT }
// from '../screens/MapScreen'` call sites keep working without pulling
// MapLibre into scope.
export { STYLE_ANCIENT, STYLE_MODERN } from '../constants/mapStyles';
export { buildPlaceToStoriesMap } from './mapScreenUtils';

interface Props {
  route: ScreenRouteProp<'Explore', 'Map'>;
  navigation: ScreenNavProp<'Explore', 'Map'>;
}

// Lazy so MapScreenNative.tsx (and therefore `@maplibre/...`) never
// evaluates in Expo Go. Marked as a module-level constant so React can
// memoise the lazy wrapper across renders.
const MapScreenNative = React.lazy(() => import('./MapScreenNative'));

function MapScreen(props: Props) {
  if (!isMapNativeAvailable()) {
    return <MapUnavailableCard reason={getMapUnavailableReason() ?? undefined} />;
  }
  return (
    <MapErrorBoundary>
      <Suspense fallback={<LazyFallback />}>
        <MapScreenNative {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}

function LazyFallback() {
  const { base } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={base.gold} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default withErrorBoundary(MapScreen);
