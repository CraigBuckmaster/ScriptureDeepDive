/**
 * BadgeChip — Generic pill-shaped chip for thread badges, era tags, etc.
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { base, radii, spacing } from '../theme';

interface Props {
  label: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
}

export function BadgeChip({ label, icon, color, onPress }: Props) {
  const accent = color ?? base.gold;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: accent + '1A', // 10% opacity
        borderWidth: 1,
        borderColor: accent + '40', // 25% opacity
        borderRadius: radii.pill,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
        gap: 4,
      }}
    >
      {icon}
      <Text style={{
        color: accent,
        fontFamily: 'SourceSans3_500Medium',
        fontSize: 11,
        letterSpacing: 0.2,
      }}>
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
