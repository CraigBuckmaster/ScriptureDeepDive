/**
 * TopicListItem — List row for a life topic in the browse screen.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

interface Props {
  title: string;
  subtitle?: string;
  categoryName?: string;
  onPress: () => void;
}

function TopicListItem({ title, subtitle, categoryName, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.row, { borderBottomColor: base.border + '40' }]}
    >
      <Text style={[styles.title, { color: base.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: base.textDim }]} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
      {categoryName ? (
        <View style={[styles.badge, { backgroundColor: base.gold + '1A', borderColor: base.gold + '40' }]}>
          <Text style={[styles.badgeText, { color: base.gold }]}>{categoryName}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default React.memo(TopicListItem);

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    marginTop: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
