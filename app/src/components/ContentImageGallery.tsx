/**
 * ContentImageGallery — Reusable horizontal image gallery for any content type.
 *
 * Features:
 * - Snap-to-item horizontal scroll with page indicator dots
 * - Cached remote images via expo-image with disk caching
 * - Loading skeleton per image
 * - Graceful fallback on load failure (hides broken image)
 * - Caption and credit text below each image
 * - Tap to open fullscreen modal with pinch-to-zoom and pan
 *
 * Generalized from DiscoveryImageGallery. Used by detail screens
 * for People, Concepts, Word Studies, Prophecy, Timeline, etc.
 *
 * Part of Epic #1071 (#1088).
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useTheme, spacing, radii, fontFamily } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GALLERY_PADDING = spacing.md;
const DEFAULT_IMAGE_WIDTH = SCREEN_WIDTH - GALLERY_PADDING * 2;

const IMAGE_HEADERS = {
  'User-Agent': 'ScriptureDeepDive/1.0 (https://companionstudy.app; contact@companionstudy.app)',
};

/** Minimal image shape accepted by the gallery. */
export interface GalleryImage {
  id?: number | string;
  url: string;
  caption?: string | null;
  credit?: string | null;
}

interface Props {
  images: GalleryImage[];
  height?: number;
}

/* ── Inline gallery image ──────────────────────────────────── */

interface ImageItemProps {
  image: GalleryImage;
  width: number;
  height: number;
  onPress: () => void;
}

function GalleryImageItem({ image, width, height, onPress }: ImageItemProps) {
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
        <View style={[styles.fallback, { height, backgroundColor: base.bgElevated }]}>
          <Text style={[styles.fallbackIcon, { color: base.textMuted }]}>🖼</Text>
          <Text style={[styles.fallbackText, { color: base.textMuted }]}>
            Image unavailable
          </Text>
        </View>
        {image.caption ? (
          <Text style={[styles.caption, { color: base.textDim }]}>{image.caption}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.imageContainer, { width }]}>
        <View style={[styles.imageWrapper, { height, backgroundColor: base.bgElevated }]}>
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="small" color={base.gold} />
            </View>
          )}
          <Image
            source={{ uri: image.url, headers: IMAGE_HEADERS }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="disk"
            onLoad={handleLoad}
            onError={handleError}
          />
        </View>
        {image.caption ? (
          <Text style={[styles.caption, { color: base.textDim }]}>{image.caption}</Text>
        ) : null}
        {image.credit ? (
          <Text style={[styles.credit, { color: base.textMuted }]}>{image.credit}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

/* ── Fullscreen zoom viewer ────────────────────────────────── */

interface ZoomViewerProps {
  image: GalleryImage;
  visible: boolean;
  onClose: () => void;
}

function ZoomViewer({ image, visible, onClose }: ZoomViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = useCallback(() => {
    scale.value = withTiming(1, { duration: 200 });
    translateX.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [scale, translateX, translateY, savedScale, savedTranslateX, savedTranslateY]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        scale.value = withTiming(1, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.1) {
        scale.value = withTiming(1, { duration: 250 });
        translateX.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(0, { duration: 250 });
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(2.5, { duration: 250 });
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleClose = useCallback(() => {
    resetTransform();
    onClose();
  }, [resetTransform, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          {/* Close button */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Zoomable image */}
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.zoomContainer, animatedStyle]}>
              <Image
                source={{ uri: image.url, headers: IMAGE_HEADERS }}
                style={styles.zoomImage}
                contentFit="contain"
                cachePolicy="disk"
              />
            </Animated.View>
          </GestureDetector>

          {/* Caption overlay */}
          {image.caption ? (
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={styles.captionOverlay}>
                <Text style={styles.captionOverlayText}>{image.caption}</Text>
                {image.credit ? (
                  <Text style={styles.creditOverlayText}>{image.credit}</Text>
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          ) : null}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/* ── Main gallery ──────────────────────────────────────────── */

export function ContentImageGallery({ images, height }: Props) {
  const { base } = useTheme();
  const imageHeight = height ?? DEFAULT_IMAGE_WIDTH * 0.65;
  const imageWidth = DEFAULT_IMAGE_WIDTH;

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<GalleryImage | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / imageWidth);
      setActiveIndex(Math.max(0, Math.min(index, images.length - 1)));
    },
    [images.length, imageWidth],
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
        snapToInterval={imageWidth}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((img, i) => (
          <GalleryImageItem
            key={img.id ?? i}
            image={img}
            width={imageWidth}
            height={imageHeight}
            onPress={() => setZoomImage(img)}
          />
        ))}
      </ScrollView>

      {/* Page indicator dots */}
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((img, i) => (
            <View
              key={img.id ?? i}
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

      {/* Fullscreen zoom modal */}
      {zoomImage && (
        <ZoomViewer
          image={zoomImage}
          visible
          onClose={() => setZoomImage(null)}
        />
      )}
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollContent: {},
  imageContainer: {
    paddingBottom: spacing.xs,
  },
  imageWrapper: {
    width: '100%',
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
  /* Zoom modal */
  modalRoot: {
    flex: 1,
  },
  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  zoomContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  captionOverlayText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  creditOverlayText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
});
