/**
 * CategoryCard — 2-column grid card for life topic categories.
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

interface Props {
  name: string;
  icon?: string;
  topicCount: number;
  onPress: () => void;
}

function CategoryCard({ name, icon, topicCount, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '20' }]}
    >
      {icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : null}
      <Text style={[styles.name, { color: base.text }]} numberOfLines={2}>
        {name}
      </Text>
      <Text style={[styles.count, { color: base.textMuted }]}>
        {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
      </Text>
    </TouchableOpacity>
  );
}

export default React.memo(CategoryCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  name: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  count: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginTop: 3,
  },
});
