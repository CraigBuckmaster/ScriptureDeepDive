/**
 * RelatedContentCard — Image-topped card for the RelatedContent carousel.
 *
 * Shows a content_images header (gradient fallback when no image),
 * title, snippet preview, and "See full X ›" link.
 *
 * Part of Epic #1130 (#COMP).
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, spacing, radii, fontFamily } from '../theme';

export interface RelatedContentItem {
  type: string;
  title: string;
  snippet: string;
  color: string;
  screen: string;
  params: Record<string, any>;
  imageUrl?: string | null;
  label: string;  // e.g. "Person", "Timeline Event", "Map Journey"
}

interface Props {
  item: RelatedContentItem;
  onPress: (item: RelatedContentItem) => void;
}

const CARD_WIDTH = 200;
const IMAGE_HEIGHT = 90;

export function RelatedContentCard({ item, onPress }: Props) {
  const { base } = useTheme();
  const [imgError, setImgError] = useState(false);
  const hasImage = !!item.imageUrl && !imgError;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.label}: ${item.title}`}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: item.color + '25' }]}
    >
      {/* Image header or gradient fallback */}
      {hasImage ? (
        <Image
          source={{ uri: item.imageUrl! }}
          style={styles.image}
          onError={() => setImgError(true)}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[item.color + '40', item.color + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.image}
        >
          <Text style={[styles.gradientLabel, { color: item.color }]}>{item.label}</Text>
        </LinearGradient>
      )}

      {/* Content */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.snippet, { color: base.textMuted }]} numberOfLines={2}>
          {item.snippet}
        </Text>
        <Text style={[styles.action, { color: item.color }]}>
          See full {item.label} ›
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export { CARD_WIDTH };

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  gradientLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
  },
  body: {
    padding: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
    marginBottom: 2,
  },
  snippet: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: spacing.xs,
  },
  action: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
  },
});
