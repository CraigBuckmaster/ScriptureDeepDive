/**
 * DepthDots — Tiny dot indicator showing panel exploration progress.
 *
 * Row of 4px circles: filled gold = opened, unfilled = not yet opened.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  explored: number;
  total: number;
}

function DepthDots({ explored, total }: Props) {
  const { base } = useTheme();

  if (total === 0) return null;

  const dots: boolean[] = [];
  for (let i = 0; i < total; i++) {
    dots.push(i < explored);
  }

  return (
    <View style={styles.container}>
      {dots.map((filled, i) => (
        <View
          key={i}
          style={[styles.dot, filled ? { backgroundColor: base.gold } : styles.unfilled]}
        />
      ))}
    </View>
  );
}

const MemoizedDepthDots = React.memo(DepthDots);
export { MemoizedDepthDots as DepthDots };
export default MemoizedDepthDots;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  unfilled: {
    backgroundColor: '#444',
  },
});
