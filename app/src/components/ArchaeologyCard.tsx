/**
 * ArchaeologyCard — Card component for the archaeology browse grid.
 *
 * Displays discovery name, category badge, location, and date range.
 * Used in ArchaeologyBrowseScreen's FlatList.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface ArchaeologyCardProps {
  name: string;
  category: string;
  location?: string;
  dateRange?: string;
  significance: string;
  onPress: () => void;
}

function ArchaeologyCardInner({
  name,
  category,
  location,
  dateRange,
  significance,
  onPress,
}: ArchaeologyCardProps) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${category}`}
      style={[
        styles.card,
        { backgroundColor: base.bgElevated, borderColor: base.border + '40' },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.emoji]}>🏛</Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: base.gold + '15', borderColor: base.gold + '30' },
          ]}
        >
          <Text style={[styles.categoryText, { color: base.gold }]}>
            {category}
          </Text>
        </View>
      </View>

      <Text style={[styles.name, { color: base.text }]} numberOfLines={2}>
        {name}
      </Text>

      {(location || dateRange) && (
        <View style={styles.metaRow}>
          {location && (
            <Text style={[styles.meta, { color: base.textMuted }]} numberOfLines={1}>
              {location}
            </Text>
          )}
          {dateRange && (
            <Text style={[styles.meta, { color: base.textMuted }]} numberOfLines={1}>
              {dateRange}
            </Text>
          )}
        </View>
      )}

      <Text
        style={[styles.significance, { color: base.textDim }]}
        numberOfLines={2}
      >
        {significance}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 20,
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: fontFamily.display,
    fontSize: 9,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  name: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  meta: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    flexShrink: 1,
  },
  significance: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },
});

export const ArchaeologyCard = React.memo(ArchaeologyCardInner);
