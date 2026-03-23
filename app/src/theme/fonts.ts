/**
 * fonts.ts — Font loading map consumed by useFonts() in App.tsx.
 *
 * Uses @expo-google-fonts packages which bundle the .ttf files
 * and export require()-able references.
 */

import {
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
} from '@expo-google-fonts/cinzel';

import {
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium_Italic,
} from '@expo-google-fonts/eb-garamond';

import {
  SourceSans3_300Light,
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
} from '@expo-google-fonts/source-sans-3';

/**
 * Pass this directly to useFonts():
 *   const [loaded] = useFonts(FONT_MAP);
 */
export const FONT_MAP = {
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium_Italic,
  SourceSans3_300Light,
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
} as const;
