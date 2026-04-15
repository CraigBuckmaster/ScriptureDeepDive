/**
 * DetailSectionTitle — Shared section heading for detail screens.
 *
 * Cinzel (displayMedium) in gold with a 3px gold bar to the left. Matches
 * the treatment used by ScreenHeader / CollapsibleSection / BrowseSectionHeader
 * so section labels read consistently across the app.
 *
 * Card #1360 (UI polish phase 3).
 */

import React from 'react';
import { View, Text, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  title: string;
  /** Optional leading icon rendered between the bar and the title. */
  icon?: React.ReactNode;
  /** Override text color. Defaults to base.gold. */
  color?: string;
  /** Additional container style (e.g. margin tweaks). */
  style?: ViewStyle;
  /** Additional title text style. */
  titleStyle?: TextStyle;
  /** Title transform: 'none' (default) keeps source casing; 'uppercase' for label-style headers. */
  transform?: 'none' | 'uppercase';
}

export function DetailSectionTitle({
  title,
  icon,
  color,
  style,
  titleStyle,
  transform = 'none',
}: Props) {
  const { base } = useTheme();
  const accent = color ?? base.gold;
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.bar, { backgroundColor: accent }]} />
      {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
      <Text
        style={[
          styles.title,
          transform === 'uppercase' && styles.uppercase,
          { color: accent },
          titleStyle,
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bar: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 16,
    marginRight: spacing.sm,
    borderRadius: 1.5,
  },
  iconSlot: {
    marginRight: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    letterSpacing: 0.6,
  },
  uppercase: {
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    fontSize: 12,
  },
});
