/**
 * MetadataPill — Small gold-bordered pill for detail-screen metadata.
 *
 * Used for verse refs, date ranges, category labels, era badges, etc. —
 * anything small, labelled, and non-actionable (or lightly tappable). For
 * strongly tappable filter chips, prefer BrowseFilterPill; for in-line
 * enumerated tags, prefer BadgeChip.
 *
 * Styling per Card #1360: gold@30 border, pill radius, spacing.sm/xs padding.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, radii, spacing, fontFamily } from '../theme';

interface Props {
  label: string;
  onPress?: () => void;
  /** Override the accent color (used for border + text). Defaults to base.gold. */
  color?: string;
  /** Accessibility label override. */
  accessibilityLabel?: string;
}

function MetadataPillImpl({ label, onPress, color, accessibilityLabel }: Props) {
  const { base } = useTheme();
  const accent = color ?? base.gold;

  const content = (
    <View
      style={[
        styles.pill,
        { borderColor: accent + '30' },
      ]}
    >
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export const MetadataPill = React.memo(MetadataPillImpl);

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
