/**
 * BookmarkButton — Per-verse bookmark toggle icon.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../theme';
import { mediumImpact } from '../utils/haptics';

interface Props {
  isBookmarked: boolean;
  onToggle: () => void;
  verseNum: number;
}

export function BookmarkButton({ isBookmarked, onToggle, verseNum }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => { mediumImpact(); onToggle(); }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={`${isBookmarked ? 'Remove' : 'Add'} bookmark for verse ${verseNum}`}
      style={styles.container}
    >
      <Text style={[styles.icon, { color: isBookmarked ? base.gold : base.textMuted + '40' }]}>
        {isBookmarked ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 20,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
});
