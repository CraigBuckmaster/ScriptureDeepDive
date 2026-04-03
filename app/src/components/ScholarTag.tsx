/**
 * ScholarTag — Colored name tag for scholar identification.
 *
 * BG: scholar color at 15% opacity. Text + border: scholar color.
 * Tap → ScholarInfoSheet.
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../theme';
import { getPanelLabel } from '../utils/panelLabels';

interface Props {
  scholarId: string;
  onPress?: () => void;
}

export function ScholarTag({ scholarId, onPress }: Props) {
  const { getScholarColor } = useTheme();
  const color = getScholarColor(scholarId);
  const label = getPanelLabel(scholarId);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Scholar: ${label}`}
      style={[styles.tagContainer, { backgroundColor: color + '26', borderColor: color + '66' }]}
    >
      <Text style={[styles.tagLabel, { color }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  tagLabel: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
