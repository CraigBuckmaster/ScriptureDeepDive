/**
 * RelatedContentCarousel — Horizontal scroll of rich image-backed cards
 * linking to related Explore features for the current chapter.
 *
 * Replaces ContinueExploringFooter with content_images support.
 * Hidden when focusMode is active or no related content exists.
 *
 * Part of Epic #1130.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RelatedContentCard, CARD_WIDTH } from './RelatedContentCard';
import type { RelatedContentItem } from './RelatedContentCard';
import { useTheme, spacing, fontFamily } from '../theme';

interface Props {
  items: RelatedContentItem[];
}

export function RelatedContentCarousel({ items }: Props) {
  const { base } = useTheme();
  const navigation = useNavigation();

  if (items.length === 0) return null;

  const handlePress = (item: RelatedContentItem) => {
    (navigation as any).navigate('ExploreTab', {
      screen: item.screen,
      params: item.params,
    });
  };

  return (
    <View style={styles.container}>
      <Text
        style={[styles.sectionLabel, { color: base.textMuted }]}
        accessibilityRole="header"
      >
        RELATED CONTENT
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
      >
        {items.map((item, i) => (
          <RelatedContentCard
            key={`${item.type}-${i}`}
            item={item}
            onPress={handlePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
