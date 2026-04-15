/**
 * MapChip — MapLibre-aware dispatcher.
 *
 * Renders null when MapLibre's native module isn't linked (Expo Go,
 * old dev builds). Otherwise lazy-loads the real MapChipNative so the
 * MapLibre import tree never evaluates in Expo Go — `requireNativeComponent`
 * inside MapLibre's MapView module would throw an Invariant Violation
 * the moment it's loaded.
 */

import React, { Suspense } from 'react';
import { isMapNativeAvailable } from '../../utils/isMapNativeAvailable';
import type { MapStory, Place } from '../../types';

interface Props {
  story: MapStory;
  places: Place[];
  onExpand: () => void;
}

const MapChipNative = React.lazy(() => import('./MapChipNative'));

export function MapChip(props: Props) {
  // Silently drop the chip when MapLibre isn't linked. The reader works
  // fine without it — this is a nice-to-have enrichment.
  if (!isMapNativeAvailable()) return null;
  return (
    <Suspense fallback={null}>
      <MapChipNative {...props} />
    </Suspense>
  );
}
