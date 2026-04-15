/**
 * SectionHeader — Cinzel heading with gold accent and bottom border.
 * Optional DepthDots indicator right-aligned when depth data provided.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';
import { DepthDots } from './DepthDots';

interface Props {
  header: string;
  explored?: number;
  total?: number;
}

function SectionHeader({ header, explored, total }: Props) {
  const { base } = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: base.border }]} accessibilityRole="header">
      <Text style={[styles.text, { color: base.gold }]} numberOfLines={2}>{header}</Text>
      {total != null && total > 0 ? (
        <View style={styles.depthWrap}>
          <DepthDots explored={explored ?? 0} total={total} />
        </View>
      ) : null}
    </View>
  );
}

const MemoizedSectionHeader = React.memo(SectionHeader);
export { MemoizedSectionHeader as SectionHeader };
export default MemoizedSectionHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: 32,
    paddingBottom: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
    flex: 1,
    marginRight: spacing.sm,
  },
  depthWrap: {
    flexShrink: 0,
  },
});
