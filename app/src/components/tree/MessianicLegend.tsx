/**
 * MessianicLegend — Small indicator explaining the golden-thread visual.
 *
 * Part of Card #1265 (Genealogy redesign Phase 1).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii, spacing } from '../../theme';

export interface MessianicLegendProps {
  /** Optional override for the explanation text. */
  label?: string;
}

export function MessianicLegend({
  label = 'Golden thread = messianic lineage to Jesus',
}: MessianicLegendProps) {
  const { base } = useTheme();

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.container,
        {
          backgroundColor: base.gold + '14',
          borderColor: base.gold + '1A',
        },
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.swatch, { backgroundColor: base.gold }]}
      />
      <Text style={[styles.label, { color: base.goldDim }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  swatch: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
});
