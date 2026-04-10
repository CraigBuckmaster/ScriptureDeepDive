/**
 * Shared styles used across Settings sub-components.
 */

import { StyleSheet } from 'react-native';
import { spacing, fontFamily } from '../../theme';

export const sharedStyles = StyleSheet.create({
  /* Section label */
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
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
