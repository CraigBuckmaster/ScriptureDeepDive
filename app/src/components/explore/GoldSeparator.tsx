/**
 * GoldSeparator — Center-bright gold separator line with subtle underglow.
 *
 * A five-segment gradient (edge → mid → center → mid → edge) approximated
 * without `expo-linear-gradient` so we don't take a new dependency just for this.
 *
 * Part of Card #1263 (Explore redesign).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

export interface GoldSeparatorProps {
  /** Vertical space (margin bottom/top) around the line. Defaults to spacing.md bottom. */
  marginBottom?: number;
  marginTop?: number;
}

export function GoldSeparator({
  marginBottom = spacing.md,
  marginTop = 0,
}: GoldSeparatorProps) {
  return (
    <View
      style={[styles.container, { marginBottom, marginTop }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Subtle underglow halo */}
      <View style={styles.halo} pointerEvents="none" />
      {/* Center-bright separator line */}
      <View style={styles.lineContainer}>
        <View style={[styles.segment, styles.segmentEdge]} />
        <View style={[styles.segment, styles.segmentMid]} />
        <View style={[styles.segment, styles.segmentCenter]} />
        <View style={[styles.segment, styles.segmentMid]} />
        <View style={[styles.segment, styles.segmentEdge]} />
      </View>
    </View>
  );
}

const SPECULAR_WARM = 'rgba(255, 235, 180,';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    top: 2,
    left: '20%',
    right: '20%',
    height: 6,
    borderRadius: 3,
    backgroundColor: SPECULAR_WARM + ' 0.04)',
  },
  lineContainer: {
    flexDirection: 'row',
    height: 2,
  },
  segment: {
    height: 2,
  },
  segmentEdge: {
    flex: 1,
    backgroundColor: SPECULAR_WARM + ' 0.1)',
  },
  segmentMid: {
    flex: 1.5,
    backgroundColor: SPECULAR_WARM + ' 0.3)',
  },
  segmentCenter: {
    flex: 2,
    backgroundColor: SPECULAR_WARM + ' 0.65)',
  },
});
