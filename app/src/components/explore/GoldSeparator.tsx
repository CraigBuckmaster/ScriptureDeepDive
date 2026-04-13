/**
 * GoldSeparator — Gradient-fade gold separator line.
 *
 * A three-segment gradient (transparent → gold15 → transparent) approximated
 * without `expo-linear-gradient` so we don't take a new dependency just for this.
 * Three stacked views produce an acceptable fade in the mobile UI.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, spacing } from '../../theme';

export interface GoldSeparatorProps {
  /** Vertical space (margin bottom/top) around the line. Defaults to spacing.md bottom. */
  marginBottom?: number;
  marginTop?: number;
}

export function GoldSeparator({
  marginBottom = spacing.md,
  marginTop = 0,
}: GoldSeparatorProps) {
  const { base } = useTheme();
  const fade = base.gold + '00';
  const mid = base.gold + '26'; // ~15% opacity

  return (
    <View
      style={[styles.container, { marginBottom, marginTop }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.segment, { backgroundColor: fade }]} />
      <View style={[styles.segment, { backgroundColor: mid }]} />
      <View style={[styles.segment, { backgroundColor: fade }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 1,
  },
  segment: {
    flex: 1,
    height: 1,
  },
});
