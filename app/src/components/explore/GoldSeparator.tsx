/**
 * GoldSeparator — Gradient-fade gold separator line with ambient glow.
 *
 * A three-segment gradient (transparent → gold15 → transparent) approximated
 * without `expo-linear-gradient` so we don't take a new dependency just for this.
 * Three stacked views produce an acceptable fade in the mobile UI.
 *
 * Now includes a subtle ambient glow above the line for the glossy treatment.
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
  /** Enable ambient glow effect above the line. Defaults to true. */
  showGlow?: boolean;
}

export function GoldSeparator({
  marginBottom = spacing.md,
  marginTop = 0,
  showGlow = true,
}: GoldSeparatorProps) {
  const { base } = useTheme();
  const fade = base.gold + '00';
  const mid = base.gold + '26'; // ~15% opacity
  const bright = 'rgba(255, 235, 180, 0.5)'; // specular-color: glossy treatment

  return (
    <View
      style={[styles.container, { marginBottom, marginTop }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Ambient glow above line */}
      {showGlow && (
        <View style={styles.glowContainer} pointerEvents="none">
          <View style={[styles.glowInner, { backgroundColor: 'rgba(255, 235, 180, 0.08)' }]} />
        </View>
      )}
      {/* Separator line */}
      <View style={styles.lineContainer}>
        <View style={[styles.segment, { backgroundColor: fade }]} />
        <View style={[styles.segmentMid, { backgroundColor: bright }]} />
        <View style={[styles.segment, { backgroundColor: fade }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -10,
    left: '25%',
    right: '25%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 150,
    height: 16,
    borderRadius: 100,
  },
  lineContainer: {
    flexDirection: 'row',
    height: 1,
  },
  segment: {
    flex: 1,
    height: 1,
  },
  segmentMid: {
    flex: 1,
    height: 1,
  },
});
