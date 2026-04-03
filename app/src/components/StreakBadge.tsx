/**
 * StreakBadge — Understated reading streak counter for HomeScreen.
 * Renders only when streak > 0. Tap to share your streak.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Flame, Share2 } from 'lucide-react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { shareStreak } from '../utils/shareVerse';

interface Props {
  streak: number;
}

function StreakBadge({ streak }: Props) {
  const { base } = useTheme();

  if (streak < 1) return null;

  return (
    <TouchableOpacity
      onPress={() => shareStreak(streak)}
      activeOpacity={0.7}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={`${streak}-day reading streak. Tap to share.`}
    >
      <Flame size={13} color={base.gold} />
      <Text style={[styles.label, { color: base.gold }]}>
        {streak}-day streak
      </Text>
      <Share2 size={10} color={base.gold} style={styles.shareIcon} />
    </TouchableOpacity>
  );
}

const MemoizedStreakBadge = React.memo(StreakBadge);
export { MemoizedStreakBadge as StreakBadge };
export default MemoizedStreakBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    opacity: 0.85,
  },
  shareIcon: {
    opacity: 0.6,
  },
});
