/**
 * theme/useOsFontScale.ts — Reactive wrapper around PixelRatio.getFontScale().
 *
 * React Native reads the OS Dynamic Type / Android font scale at module
 * load but does not notify on change; users who toggle the setting mid-
 * session would otherwise see stale values until app restart. Re-reading
 * on AppState 'active' catches the common case where the user leaves to
 * Settings, changes the scale, and comes back.
 */

import { useEffect, useState } from 'react';
import { AppState, PixelRatio } from 'react-native';

export function useOsFontScale(): number {
  const [scale, setScale] = useState<number>(() => PixelRatio.getFontScale());

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const next = PixelRatio.getFontScale();
        setScale((prev) => (prev === next ? prev : next));
      }
    });
    return () => sub.remove();
  }, []);

  return scale;
}
