/**
 * NoteIndicator — Per-verse note icon.
 * Gold if note exists, muted if not. 44pt touch target.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  verseNum: number;
  hasNote: boolean;
  onPress: (verseNum: number) => void;
}

export function NoteIndicator({ verseNum, hasNote, onPress }: Props) {
  const { base } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onPress(verseNum)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`${hasNote ? 'Edit' : 'Add'} note for verse ${verseNum}`}
      style={styles.container}
    >
      <Text style={[styles.icon, { color: hasNote ? base.gold : base.textMuted + '40' }]}>
        ✎
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
  },
});
