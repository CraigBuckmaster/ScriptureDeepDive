/**
 * StreakBadge — Understated reading streak counter for HomeScreen.
 * Renders only when streak > 0.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { base, spacing, fontFamily } from '../theme';

interface Props {
  streak: number;
}

export function StreakBadge({ streak }: Props) {
  if (streak < 1) return null;

  return (
    <View style={styles.container}>
      <Flame size={13} color={base.gold} />
      <Text style={styles.label}>
        {streak}-day streak
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  label: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    opacity: 0.85,
  },
});
