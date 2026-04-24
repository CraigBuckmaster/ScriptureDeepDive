/**
 * theme/useTypography.ts — Typography hook combining OS and in-app scales.
 *
 * Returns the scaled preset maps for content and chrome plus the raw
 * effective multipliers (so the Settings editor can show users the
 * combined scale). Memoized on the two input scales.
 */

import { useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { buildTypography, type BuiltTypography } from './typography';
import { useOsFontScale } from './useOsFontScale';

export function useTypography(): BuiltTypography {
  const osScale = useOsFontScale();
  const readingScale = useSettingsStore((s) => s.readingScale);
  return useMemo(() => buildTypography(osScale, readingScale), [osScale, readingScale]);
}
