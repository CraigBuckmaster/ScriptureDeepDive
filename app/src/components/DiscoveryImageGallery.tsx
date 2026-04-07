/**
 * DiscoveryImageGallery — Horizontal swipeable image gallery for archaeological discoveries.
 *
 * Features:
 * - Snap-to-item horizontal scroll with page indicator dots
 * - Cached remote images via React Native Image
 * - Loading skeleton per image
 * - Graceful fallback on load failure (hides broken image)
 * - Caption and credit text below each image
 *
 * Reusable for any discovery entry that has images.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ArchaeologyImage } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GALLERY_PADDING = spacing.md;
const IMAGE_WIDTH = SCREEN_WIDTH - GALLERY_PADDING * 2;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.65;

interface Props {
  images: ArchaeologyImage[];
}

interface ImageItemProps {
  image: ArchaeologyImage;
  width: number;
}

function GalleryImage({ image, width }: ImageItemProps) {
  const { base } = useTheme();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const handleLoad = useCallback(() => setLoading(false), []);
  const handleError = useCallback(() => {
    setLoading(false);
    setFailed(true);
  }, []);

  if (failed) {
    return (
      <View style={[styles.imageContainer, { width, backgroundColor: base.bgElevated }]}>
        <View style={[styles.fallback, { backgroundColor: base.bgElevated }]}>
          <Text style={[styles.fallbackIcon, { color: base.textMuted }]}>🏛</Text>
          <Text style={[styles.fallbackText, { color: base.textMuted }]}>
            Image unavailable
          </Text>
        </View>
        {image.caption && (
          <Text style={[styles.caption, { color: base.textDim }]}>{image.caption}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.imageContainer, { width }]}>
      <View style={[styles.imageWrapper, { backgroundColor: base.bgElevated }]}>
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="small" color={base.gold} />
          </View>
        )}
        <Image
          source={{
            uri: image.url,
            headers: {
              'User-Agent': 'ScriptureDeepDive/1.0 (https://companionstudy.app; contact@companionstudy.app)',
            },
          }}
          style={styles.image}
          resizeMode="contain"
          onLoad={handleLoad}
          onError={handleError}
        />
      </View>
      {image.caption && (
        <Text style={[styles.caption, { color: base.textDim }]}>{image.caption}</Text>
      )}
      {image.credit && (
        <Text style={[styles.credit, { color: base.textMuted }]}>{image.credit}</Text>
      )}
    </View>
  );
}

export function DiscoveryImageGallery({ images }: Props) {
  const { base } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / IMAGE_WIDTH);
      setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
    },
    [images.length],
  );

  if (images.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={IMAGE_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((img) => (
          <GalleryImage key={img.id} image={img} width={IMAGE_WIDTH} />
        ))}
      </ScrollView>

      {/* Page indicator dots */}
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((img, i) => (
            <View
              key={img.id}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? base.gold : base.textMuted + '40',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {
    // no extra padding — images fill the scroll area
  },
  imageContainer: {
    paddingBottom: spacing.xs,
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fallback: {
    width: '100%',
    height: IMAGE_HEIGHT,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  fallbackText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  credit: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
