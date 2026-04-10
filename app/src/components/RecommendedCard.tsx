/**
 * RecommendedCard — Wide editorial card for "Recommended for you" section.
 *
 * 310px width, 130px image, gold-tinted border, chevron in text area,
 * and "View [type] ›" deep-link CTA in caption overlay.
 * Shares cycling + dual-tap patterns with FeatureCard.
 *
 * Part of Epic #1071 (#1076).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ExploreImage } from '../types';
import type { ExploreRecommendation } from '../hooks/useExploreRecommendations';

// ── Screen → label mapping ─────────────────────────────────

const SCREEN_LABELS: Record<string, string> = {
  ArchaeologyDetail: 'View discovery',
  ArchaeologyBrowse: 'View discoveries',
  ProphecyBrowse: 'View chain',
  ProphecyDetail: 'View chain',
  ConceptBrowse: 'View concept',
  PersonDetail: 'View person',
  GenealogyTree: 'View family tree',
  Map: 'View journey',
  Timeline: 'View event',
  WordStudyBrowse: 'View study',
  DebateBrowse: 'View debate',
  HarmonyBrowse: 'View parallel',
  GrammarBrowse: 'View article',
  ScholarBrowse: 'View scholar',
  ThreadBrowse: 'View thread',
  TopicBrowse: 'View topic',
  LifeTopics: 'View topic',
  LensBrowse: 'View lens',
  TimeTravelBrowse: 'View reading',
  DifficultPassagesBrowse: 'View passage',
  DictionaryBrowse: 'View definition',
  Concordance: 'View search',
  ContentLibrary: 'View resource',
};

interface Props {
  recommendation: ExploreRecommendation;
  onPress: () => void;
  isPremium: boolean;
  images?: ExploreImage[];
  onImagePress?: (deepLink: { screen: string; params?: Record<string, string> }) => void;
  staggerMs?: number;
}

const CARD_WIDTH = 310;
const IMAGE_HEIGHT = 130;
const CYCLE_INTERVAL = 6000;

export function RecommendedCard({
  recommendation,
  onPress,
  isPremium,
  images,
  onImagePress,
  staggerMs = 0,
}: Props) {
  const { base } = useTheme();
  const isLocked = recommendation.premium && !isPremium;
  const hasImages = images && images.length > 0;

  // ── Image cycling ────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

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

  // Caption CTA label
  const captionLabel = currentImage
    ? SCREEN_LABELS[currentImage.deepLink.screen] ?? 'View'
    : null;

  return (
    <View style={[styles.card, {
      backgroundColor: base.bgElevated,
      borderColor: base.gold + '1F',
    }]}>
      {/* ── Image header ─── */}
      {currentImage ? (
        <TouchableOpacity
          onPress={handleImagePress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={currentImage.caption ?? `${recommendation.title} image`}
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
            <View style={styles.imageGradient} />
            {/* Gold CTA caption */}
            {captionLabel && (
              <Text style={[styles.captionCta, { color: base.goldBright }]}>
                {captionLabel} ›
              </Text>
            )}
            {/* Indicator dots */}
            {validImages.length > 1 && (
              <View style={styles.dots}>
                {validImages.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, {
                      backgroundColor: i === safeIndex ? '#fff' : 'rgba(255,255,255,0.4)', // overlay-color: intentional
                    }]}
                  />
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.fallbackStrip, { backgroundColor: recommendation.color + '30' }]} />
      )}

      {/* ── Text area with chevron ─── */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${recommendation.title}: ${recommendation.subtitle}${isLocked ? ', requires Companion+' : ''}`}
        style={styles.textArea}
      >
        <View style={styles.textContent}>
          <View style={styles.textLeft}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: recommendation.color }]} numberOfLines={1}>
                {recommendation.title}
              </Text>
              {isLocked && <Text style={[styles.lockIcon, { color: base.gold }]}>✦</Text>}
            </View>
            <Text style={[styles.subtitle, { color: base.textMuted }]} numberOfLines={2}>
              {recommendation.subtitle}
            </Text>
          </View>
          <ChevronRight size={16} color={base.textMuted} style={styles.chevron} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

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
    height: 40,
    backgroundColor: 'transparent',
    shadowColor: '#000', // overlay-color: intentional
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  captionCta: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.8)', // overlay-color: intentional
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    top: 6,
    right: 8,
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
    height: 8,
  },
  // Text area
  textArea: {
    padding: spacing.sm + 4,
  },
  textContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textLeft: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 15,
    flex: 1,
  },
  lockIcon: {
    fontSize: 10,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

export { CARD_WIDTH as RECOMMENDED_CARD_WIDTH };
