/**
 * FeatureCard — Image-forward card in an Explore feature carousel.
 *
 * 174px fixed width with cycling image header (88px), caption overlay,
 * indicator dots, title, subtitle, and gold count CTA.
 * Image tap → deep-link; text tap → feature browse screen.
 *
 * Part of Epic #1071 (#1075).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ExploreImage } from '../types';

export interface FeatureCardData {
  title: string;
  subtitle: string;
  color: string;
  screen: string;
  params?: Record<string, string>;
  premium?: boolean;
}

interface Props {
  feature: FeatureCardData;
  onPress: () => void;
  isPremium: boolean;
  images?: ExploreImage[];
  count?: number | null;
  noun?: string;
  onImagePress?: (deepLink: { screen: string; params?: Record<string, string> }) => void;
  /** Stagger offset in ms to prevent synchronised cycling across cards */
  staggerMs?: number;
}

const IMAGE_HEIGHT = 88;
const CYCLE_INTERVAL = 6000;

export function FeatureCard({
  feature,
  onPress,
  isPremium,
  images,
  count,
  noun,
  onImagePress,
  staggerMs = 0,
}: Props) {
  const { base } = useTheme();
  const isLocked = feature.premium && !isPremium;
  const hasImages = images && images.length > 0;

  // ── Image cycling ────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

    // Stagger start so cards don't cycle in unison
    const staggerTimer = setTimeout(() => {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }, CYCLE_INTERVAL);
    }, staggerMs);

    return () => {
      clearTimeout(staggerTimer);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasImages, images?.length, staggerMs]);

  const validImages = hasImages ? images.filter((img) => !failedUrls.has(img.url)) : [];
  const safeIndex = validImages.length > 0 ? activeIndex % validImages.length : 0;
  const currentImage = validImages.length > 0 ? validImages[safeIndex] : null;

  const handleImagePress = () => {
    if (currentImage && onImagePress) {
      onImagePress(currentImage.deepLink);
    }
  };

  // ── Count CTA text ───────────────────────────────────────
  const ctaText = count != null && noun ? `${count} ${noun} ›` : null;

  return (
    <View style={[styles.card, {
      backgroundColor: base.bgElevated,
      borderColor: base.gold + '12',
    }]}>
      {/* ── Image header ─── */}
      {currentImage ? (
        <TouchableOpacity
          onPress={handleImagePress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={currentImage.caption ?? `${feature.title} image`}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImage.url }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="disk"
              transition={400}
              onError={() => setFailedUrls((prev) => new Set(prev).add(currentImage.url))}
              recyclingKey={currentImage.url}
            />
            {/* Gradient overlay for caption legibility */}
            <View style={styles.imageGradient} />
            {/* Caption */}
            {currentImage.caption ? (
              <Text style={styles.caption} numberOfLines={1}>
                {currentImage.caption}
              </Text>
            ) : null}
            {/* Indicator dots */}
            {validImages.length > 1 && (
              <View style={styles.dots}>
                {validImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, {
                      backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)', // overlay-color: intentional
                    }]}
                  />
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        /* Fallback: accent-colored strip */
        <View style={[styles.fallbackStrip, { backgroundColor: base.gold + '20' }]} />
      )}

      {/* ── Text area (tappable → feature browse) ─── */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${feature.title}: ${feature.subtitle}${isLocked ? ', requires Companion+' : ''}`}
        style={styles.textArea}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
            {feature.title}
          </Text>
          {isLocked && <Text style={[styles.lockIcon, { color: base.gold }]}>✦</Text>}
        </View>
        <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={2}>
          {feature.subtitle}
        </Text>
        {ctaText && (
          <Text style={[styles.cta, { color: base.gold }]}>{ctaText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const CARD_WIDTH = 174;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  // Image section
  imageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'transparent',
    // Simulated gradient via layered shadow
    shadowColor: '#000', // overlay-color: intentional
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  caption: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    right: 24,
    color: '#fff', // overlay-color: intentional (caption on image)
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.8)', // overlay-color: intentional
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Fallback
  fallbackStrip: {
    width: CARD_WIDTH,
    height: 6,
  },
  // Text area
  textArea: {
    padding: spacing.sm + 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    flex: 1,
  },
  lockIcon: {
    fontSize: 10,
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

export { CARD_WIDTH };
