/**
 * TrustBadge — Displays a user's trust level with colored badge.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, radii, fontFamily } from '../theme';

const LEVEL_COLORS: Record<0 | 1 | 2, string> = {
  0: '#888888', // data-color: intentional
  1: '#bfa050', // data-color: intentional
  2: '#50b060', // data-color: intentional
};

const LEVEL_LABELS: Record<0 | 1 | 2, string> = {
  0: 'New',
  1: 'Trusted',
  2: 'Verified',
};

interface Props {
  level: 0 | 1 | 2;
  label?: string;
}

function TrustBadge({ level, label }: Props) {
  const color = LEVEL_COLORS[level];
  const text = label ?? LEVEL_LABELS[level];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});

export default React.memo(TrustBadge);
