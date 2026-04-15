/**
 * StreakBadge — Understated reading streak counter for HomeScreen.
 * Renders only when streak > 0. Tap to share your streak.
 *
 * Card #1361 (UI polish phase 4): active streaks get a subtle gold glow
 * via a shadow layer behind the badge.
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
    <View style={styles.wrapper}>
      {/* Subtle gold glow halo rendered behind the badge. */}
      <View style={[styles.glow, { backgroundColor: base.gold }]} pointerEvents="none" />
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
    </View>
  );
}

const MemoizedStreakBadge = React.memo(StreakBadge);
export { MemoizedStreakBadge as StreakBadge };
export default MemoizedStreakBadge;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 4,
    right: 4,
    borderRadius: 999,
    opacity: 0.12,
    // iOS shadow for the glow halo. RN shadows must originate from a solid
    // background, so this semi-opaque pill provides the substrate.
    shadowColor: '#bfa050', // overlay-color: intentional (gold halo)
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    // Android needs elevation for glow effect
    elevation: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
