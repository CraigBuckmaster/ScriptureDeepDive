/**
 * DifficultyBadge — Compact 1-5 difficulty indicator for chapter cells.
 *
 * Renders a row of small dots colored by difficulty level.
 * Used in ChapterListScreen to show interpretive complexity at a glance.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  /** Difficulty level 1-5. */
  level: number;
}

/** Map difficulty level to dot color. */
function getDifficultyColor(level: number, base: { gold: string; textMuted: string; danger: string }): string {
  switch (level) {
    case 1: return base.textMuted;
    case 2: return base.gold + '90';
    case 3: return base.gold;
    case 4: return '#e8a040'; // data-color: intentional
    case 5: return base.danger;
    default: return base.textMuted;
  }
}

export const DifficultyBadge = memo(function DifficultyBadge({ level }: Props) {
  const { base } = useTheme();
  const color = getDifficultyColor(level, base);

  return (
    <View style={styles.row}>
      {Array.from({ length: level }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
    marginTop: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
