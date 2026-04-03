/**
 * BadgeChip — Generic pill-shaped chip for thread badges, era tags, etc.
 */

import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme, radii, spacing, fontFamily } from '../theme';

interface Props {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
}

function BadgeChip({ label, icon, color, onPress }: Props) {
  const { base } = useTheme();
  const accent = color ?? base.gold;

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: accent + '1A', // 10% opacity
          borderColor: accent + '40', // 25% opacity
        },
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: accent }]}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const MemoizedBadgeChip = React.memo(BadgeChip);
export { MemoizedBadgeChip as BadgeChip };
export default MemoizedBadgeChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    gap: 4,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
