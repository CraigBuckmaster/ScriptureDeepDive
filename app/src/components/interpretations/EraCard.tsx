/**
 * EraCard — Displays a church history era with name, date range, and color.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily, churchEras } from '../../theme';
import type { InterpretationEra } from '../../types';

interface Props {
  era: InterpretationEra;
  onPress?: () => void;
}

export const EraCard = React.memo(function EraCard({ era, onPress }: Props) {
  const { base } = useTheme();
  const color = churchEras[era.id] ?? base.gold;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${era.name}, ${era.date_range}`}
      style={[
        styles.card,
        { backgroundColor: base.bgElevated, borderColor: color + '40' },
      ]}
    >
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: base.text }]}>{era.name}</Text>
        <Text style={[styles.dateRange, { color }]}>{era.date_range}</Text>
        <Text style={[styles.description, { color: base.textDim }]} numberOfLines={3}>
          {era.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  colorBar: {
    height: 4,
  },
  body: {
    padding: spacing.md,
  },
  name: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: 2,
  },
  dateRange: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
