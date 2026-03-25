/**
 * hooks/useLandscapeUnlock.ts — Per-screen landscape support.
 *
 * Call this hook in any screen that should allow landscape rotation.
 * On mount: unlocks orientation to allow all orientations.
 * On unmount: re-locks to portrait so the rest of the app stays upright.
 *
 * Requires:
 *   - expo-screen-orientation installed
 *   - app.json "orientation": "default" (native-level)
 *   - App.tsx locks to PORTRAIT_UP on startup
 */

import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export function useLandscapeUnlock() {
  useEffect(() => {
    ScreenOrientation.unlockAsync();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    };
  }, []);
}
