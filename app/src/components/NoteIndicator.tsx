/**
 * NoteIndicator — Per-verse note icon.
 * Gold if note exists, muted if not. 44pt touch target.
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { base, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  verseNum: number;
  hasNote: boolean;
  onPress: (verseNum: number) => void;
}

export function NoteIndicator({ verseNum, hasNote, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => onPress(verseNum)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`${hasNote ? 'Edit' : 'Add'} note for verse ${verseNum}`}
      style={{
        width: 24,
        minHeight: MIN_TOUCH_TARGET,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{
        fontSize: 14,
        color: hasNote ? base.gold : base.textMuted + '40',
      }}>
        ✎
      </Text>
    </TouchableOpacity>
  );
}
