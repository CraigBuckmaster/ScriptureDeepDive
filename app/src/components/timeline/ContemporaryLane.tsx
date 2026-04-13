/**
 * ContemporaryLane — Thin vertical overlap bands in the left gutter.
 *
 * In person-filter mode we render up to 4 stacked bands in the spine
 * gutter showing which contemporaries' lifespans overlap the filtered
 * person at each event row. Purely decorative — no interaction.
 *
 * Part of Card #1266 (Timeline Phase 2).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export const MAX_LANES = 4;

export interface ContemporaryLaneProps {
  /** Whether each lane (up to MAX_LANES) is active on this row. Length is clamped to MAX_LANES. */
  laneActive: boolean[];
  /** Height the lanes should span — usually matches the row height. */
  height?: number;
}

export function ContemporaryLane({ laneActive, height }: ContemporaryLaneProps) {
  const { base } = useTheme();

  const lanes = laneActive.slice(0, MAX_LANES);
  const fill = base.textMuted + '26'; // ~15% opacity

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrapper, height != null ? { height } : null]}
    >
      {lanes.map((active, i) => (
        <View
          key={i}
          style={[
            styles.lane,
            {
              backgroundColor: active ? fill : 'transparent',
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 2,
  },
  lane: {
    width: 2,
  },
});
