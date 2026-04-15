/**
 * ContinueReadingHero — Full-width hero card with cycling book image.
 *
 * Image header (160px), caption overlay, dot indicators, gradient fade,
 * text area with book/chapter + "Continue" CTA button.
 *
 * Fallback chain: book images → key person images → accent strip.
 * New user state: "Begin your journey" with Genesis CTA.
 *
 * Part of Epic #1089 (#1090).
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { useContentImages } from '../hooks/useContentImages';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ContentImage } from '../types';
import type { RecentChapter } from '../types';

const IMAGE_HEIGHT = 160;
const CYCLE_INTERVAL = 8000;

// Key person for each book (used as fallback when book has no images)
const BOOK_FALLBACK_PERSON: Record<string, string> = {
  genesis: 'abraham', exodus: 'moses', leviticus: 'moses', numbers: 'moses',
  deuteronomy: 'moses', joshua: 'joshua', judges: 'samson', ruth: 'ruth',
  '1_samuel': 'david', '2_samuel': 'david', '1_kings': 'solomon', '2_kings': 'elijah',
  '1_chronicles': 'david', '2_chronicles': 'solomon', ezra: 'ezra', nehemiah: 'nehemiah',
  esther: 'esther', job: 'job', psalms: 'david', proverbs: 'solomon',
  isaiah: 'isaiah', jeremiah: 'jeremiah', ezekiel: 'ezekiel', daniel: 'daniel',
  hosea: 'hosea', jonah: 'jonah', matthew: 'jesus', mark: 'jesus',
  luke: 'jesus', john: 'jesus', acts: 'paul', romans: 'paul',
  revelation: 'john',
};

interface Props {
  mostRecent: RecentChapter | null;
  onPress: () => void;
}

export function ContinueReadingHero({ mostRecent, onPress }: Props) {
  const { base } = useTheme();

  const bookId = mostRecent?.book_id ?? 'genesis';
  const fallbackPerson = BOOK_FALLBACK_PERSON[bookId];

  // Fallback chain: book images → person images
  const { images: bookImages } = useContentImages('book', bookId);
  const { images: personImages } = useContentImages('people', fallbackPerson);

  // Use book images first, then person, then empty
  const images: ContentImage[] = bookImages.length > 0
    ? bookImages
    : personImages;

  const hasImages = images.length > 0;

  // ── Image cycling (8s interval) ──────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, CYCLE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasImages, images.length]);

  // Filter to images that haven't failed
  const validImages = hasImages
    ? images.filter((img) => !failedUrls.has(img.url))
    : [];
  const safeIndex = validImages.length > 0 ? activeIndex % validImages.length : 0;
  const currentImage = validImages.length > 0 ? validImages[safeIndex] : null;
  const showImages = currentImage !== null;

  // ── Display text ──────────────────────────────────────────
  const titleText = mostRecent
    ? `${mostRecent.book_name} · Chapter ${mostRecent.chapter_num}`
    : 'Begin Your Journey';
  const subtitleText = mostRecent
    ? mostRecent.title ?? 'Continue reading'
    : 'Start reading through Scripture';
  const ctaText = mostRecent ? 'Continue' : 'Genesis 1';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.gold + '1F' }]}
      accessibilityRole="button"
      accessibilityLabel={`${titleText}: ${subtitleText}. Tap to ${ctaText.toLowerCase()}`}
    >
      {/* ── Image header ─── */}
      {showImages ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage.url }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            transition={500}
            onError={() => setFailedUrls((prev) => new Set(prev).add(currentImage.url))}
            recyclingKey={currentImage.url}
          />
          {/* Gradient fade */}
          <View style={styles.gradient} />
          {/* Caption */}
          {currentImage.caption ? (
            <Text style={styles.caption} numberOfLines={1}>
              {currentImage.caption}
            </Text>
          ) : null}
          {/* Dot indicators */}
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
      ) : (
        /* Fallback: accent gradient strip */
        <View style={[styles.fallbackStrip, { backgroundColor: base.gold + '15' }]} />
      )}

      {/* ── Text area ─── */}
      <View style={styles.textArea}>
        <View style={styles.textLeft}>
          <Text style={[styles.title, { color: base.text }]} numberOfLines={1}>
            {titleText}
          </Text>
          <Text style={[styles.subtitle, { color: base.textDim }]} numberOfLines={1}>
            {subtitleText}
          </Text>
        </View>
        <View style={[styles.ctaButton, { backgroundColor: base.gold + '20', borderColor: base.gold + '40' }]}>
          <Text style={[styles.ctaText, { color: base.gold }]}>{ctaText}</Text>
          <ArrowRight size={13} color={base.gold} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Image section
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
    height: 48,
    backgroundColor: 'transparent',
    shadowColor: '#000', // overlay-color: intentional (RN shadow must be #000 on iOS)
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  caption: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    right: 30,
    color: '#fff', // overlay-color: intentional (caption on image)
    fontFamily: fontFamily.ui,
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.8)', // overlay-color: intentional
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  // Fallback
  fallbackStrip: {
    width: '100%',
    height: 8,
  },
  // Text area
  textArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  textLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  ctaText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
