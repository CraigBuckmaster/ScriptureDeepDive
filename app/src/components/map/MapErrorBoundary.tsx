/**
 * MapErrorBoundary — Inner boundary around the lazy MapLibre subtree.
 *
 * The dispatcher (MapScreen.tsx) gates on isMapNativeAvailable() before
 * rendering the native MapView, but that gate only checks whether the
 * native module *exists*. It cannot detect a partially-broken module
 * (e.g. MapLibre v10 under the New Architecture, where MLRNModule is
 * registered but MLRNMapView throws at fabric-component instantiation).
 *
 * When that happens we want to:
 *   1. Catch the render-time error inside the lazy subtree.
 *   2. Show MapUnavailableCard with a diagnostic instead of the generic
 *      "Something went wrong" screen.
 *   3. NOT retry. The outer ScreenErrorBoundary's retry would re-mount
 *      the native screen and crash again on the same tick — an infinite
 *      loop. This boundary stays in fallback for the rest of the
 *      screen's lifetime; the user must navigate away and back.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../utils/logger';
import { MapUnavailableCard } from './MapUnavailableCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('MapErrorBoundary', error.message, {
      error,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <MapUnavailableCard reason={this.state.error?.message} />;
    }
    return this.props.children;
  }
}
