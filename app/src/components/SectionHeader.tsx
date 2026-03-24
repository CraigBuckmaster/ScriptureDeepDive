/**
 * SectionHeader — Cinzel heading with gold accent and bottom border.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { base, spacing, fontFamily } from '../theme';

interface Props {
  header: string;
}

export function SectionHeader({ header }: Props) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <Text style={styles.text}>{header}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: base.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  text: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
