/**
 * FullWidthImageCard — Full-bleed image card with title/subtitle overlay + count CTA.
 *
 * Same layout family as ContinueReadingHero's image header but simpler — static,
 * single-image, and designed for an Explore-section full-width hero (e.g., Life Topics).
 *
 * Part of Card #1263 (Explore redesign).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { ExploreImage } from '../../types';

const IMAGE_HEIGHT = 85;

export interface FullWidthImageCardProps {
  title: string;
  subtitle?: string;
  image?: ExploreImage | null;
  count?: number | null;
  noun?: string;
  onPress: () => void;
}

export function FullWidthImageCard({
  title,
  subtitle,
  image,
  count,
  noun,
  onPress,
}: FullWidthImageCardProps) {
  const { base } = useTheme();

  const ctaText = count != null && noun ? `${count} ${noun} ›` : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${title}${subtitle ? `: ${subtitle}` : ''}`}
      style={[
        styles.card,
        {
          backgroundColor: base.bgElevated,
          borderColor: base.gold + '18',
        },
      ]}
    >
      {image ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image.url }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            transition={400}
            recyclingKey={image.url}
          />
          <View style={styles.gradient} />
        </View>
      ) : (
        <View
          style={[
            styles.fallback,
            { backgroundColor: base.tintWarm || base.gold + '10' },
          ]}
        />
      )}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {ctaText ? <Text style={[styles.cta, { color: base.gold }]}>{ctaText}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'transparent', // overlay-color: intentional
    shadowColor: '#000', // overlay-color: intentional
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fallback: {
    width: '100%',
    height: 10,
  },
  textArea: {
    padding: spacing.sm + 2,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  cta: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    marginTop: 4,
  },
});
