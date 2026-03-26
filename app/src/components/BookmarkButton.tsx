/**
 * BookmarkButton — Per-verse bookmark toggle icon.
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { base, MIN_TOUCH_TARGET } from '../theme';
import { mediumImpact } from '../utils/haptics';

interface Props {
  isBookmarked: boolean;
  onToggle: () => void;
  verseNum: number;
}

export function BookmarkButton({ isBookmarked, onToggle, verseNum }: Props) {
  return (
    <TouchableOpacity
      onPress={() => { mediumImpact(); onToggle(); }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={`${isBookmarked ? 'Remove' : 'Add'} bookmark for verse ${verseNum}`}
      style={{ width: 20, minHeight: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 14, color: isBookmarked ? base.gold : base.textMuted + '40' }}>
        {isBookmarked ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
  );
}
