/**
 * SectionHeader — Cinzel heading with gold accent and bottom border.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { base, spacing } from '../theme';

interface Props {
  header: string;
}

export function SectionHeader({ header }: Props) {
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: base.border,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
      }}
      accessibilityRole="header"
    >
      <Text style={{
        color: base.gold,
        fontFamily: 'Cinzel_500Medium',
        fontSize: 13,
        lineHeight: 20,
        letterSpacing: 0.3,
      }}>
        {header}
      </Text>
    </View>
  );
}
