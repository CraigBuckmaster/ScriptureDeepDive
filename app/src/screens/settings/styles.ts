/**
 * Shared styles used across Settings sub-components.
 *
 * Card #1364 (UI polish phase 7): section labels use Cinzel displayMedium
 * in gold uppercase for consistency with the rest of the app's section
 * typography (ScreenHeader / BrowseSectionHeader / DetailSectionTitle).
 * Section-label color is applied per-call via inline style so palette
 * changes still flow through theming.
 */

import { StyleSheet } from 'react-native';
import { spacing, fontFamily } from '../../theme';

export const sharedStyles = StyleSheet.create({
  /* Section label — upgraded to Cinzel gold (phase 7). Callers add color. */
  sectionLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
  },

  /* Preference rows */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },

  /* Translation hint — used by TranslationManager and VoicePicker */
  translationHint: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
});
