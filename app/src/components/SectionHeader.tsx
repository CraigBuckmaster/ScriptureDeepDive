/**
 * SectionHeader — Cinzel heading with gold accent and bottom border.
 * Optional DepthDots indicator right-aligned when depth data provided.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DepthDots } from './DepthDots';
import { base, spacing, fontFamily } from '../theme';

interface Props {
  header: string;
  explored?: number;
  total?: number;
}

export function SectionHeader({ header, explored, total }: Props) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <Text style={styles.text}>{header}</Text>
      {total != null && total > 0 ? (
        <DepthDots explored={explored ?? 0} total={total} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: base.border,
    paddingHorizontal: spacing.md,
    paddingTop: 32,
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
