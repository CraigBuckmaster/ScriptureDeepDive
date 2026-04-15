/**
 * SectionHeader — Cinzel heading with 3px gold bar accent.
 * Optional DepthDots indicator right-aligned when depth data provided.
 *
 * Card #1362 (UI polish phase 5): replaces the hard bottom-border with a
 * left-side 3px gold bar accent, matching ScreenHeader / BrowseSectionHeader.
 * GoldSeparator is rendered between SectionBlocks in the list itself.
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
    <View style={styles.container} accessibilityRole="header">
      <View style={[styles.bar, { backgroundColor: base.gold }]} />
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  bar: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 16,
    marginRight: spacing.sm,
    borderRadius: 1.5,
  },
  text: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.4,
    flex: 1,
    marginRight: spacing.sm,
  },
  depthWrap: {
    flexShrink: 0,
  },
});
