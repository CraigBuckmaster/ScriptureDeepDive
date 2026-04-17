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
  Animated,
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
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { ImageCredit } from './ImageCredit';

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
        <ImageCredit credit={image.credit} />
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
  // Animated values drive the transform. Paired refs mirror current values so
  // gesture callbacks (which run on the JS thread via .runOnJS(true)) can
  // read them synchronously — Animated.Value has no sync getter.
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const scaleRef = useRef(1);
  const savedScaleRef = useRef(1);
  const translateXRef = useRef(0);
  const savedTranslateXRef = useRef(0);
  const translateYRef = useRef(0);
  const savedTranslateYRef = useRef(0);

  // Helper: set both the Animated.Value and the shadow ref.
  const setScale = useCallback((v: number) => {
    scaleRef.current = v;
    scale.setValue(v);
  }, [scale]);
  const setTx = useCallback((v: number) => {
    translateXRef.current = v;
    translateX.setValue(v);
  }, [translateX]);
  const setTy = useCallback((v: number) => {
    translateYRef.current = v;
    translateY.setValue(v);
  }, [translateY]);

  // Animate helper: runs Animated.timing and keeps the ref in sync.
  const animateTo = useCallback((value: Animated.Value, ref: React.MutableRefObject<number>, to: number, duration: number) => {
    ref.current = to;
    Animated.timing(value, { toValue: to, duration, useNativeDriver: true }).start();
  }, []);

  const resetTransform = useCallback(() => {
    animateTo(scale, scaleRef, 1, 200);
    animateTo(translateX, translateXRef, 0, 200);
    animateTo(translateY, translateYRef, 0, 200);
    savedScaleRef.current = 1;
    savedTranslateXRef.current = 0;
    savedTranslateYRef.current = 0;
  }, [animateTo, scale, translateX, translateY]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      setScale(Math.max(1, Math.min(savedScaleRef.current * e.scale, 5)));
    })
    .onEnd(() => {
      if (scaleRef.current < 1.1) {
        animateTo(scale, scaleRef, 1, 200);
        animateTo(translateX, translateXRef, 0, 200);
        animateTo(translateY, translateYRef, 0, 200);
        savedScaleRef.current = 1;
        savedTranslateXRef.current = 0;
        savedTranslateYRef.current = 0;
      } else {
        savedScaleRef.current = scaleRef.current;
      }
    })
    .runOnJS(true);

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (savedScaleRef.current > 1) {
        setTx(savedTranslateXRef.current + e.translationX);
        setTy(savedTranslateYRef.current + e.translationY);
      }
    })
    .onEnd(() => {
      savedTranslateXRef.current = translateXRef.current;
      savedTranslateYRef.current = translateYRef.current;
    })
    .runOnJS(true);

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scaleRef.current > 1.1) {
        animateTo(scale, scaleRef, 1, 250);
        animateTo(translateX, translateXRef, 0, 250);
        animateTo(translateY, translateYRef, 0, 250);
        savedScaleRef.current = 1;
        savedTranslateXRef.current = 0;
        savedTranslateYRef.current = 0;
      } else {
        animateTo(scale, scaleRef, 2.5, 250);
        savedScaleRef.current = 2.5;
      }
    })
    .runOnJS(true);

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTapGesture, panGesture),
  );

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale },
    ],
  };

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
        {/* overlay-color: intentional — fullscreen image viewer backdrop */}
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
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.captionOverlay}>
              {image.caption ? (
                <Text style={styles.captionOverlayText}>{image.caption}</Text>
              ) : null}
              <Text style={styles.creditOverlayText}>
                Image: {image.credit || 'Public domain via Wikimedia Commons'}
              </Text>
            </View>
          </TouchableWithoutFeedback>
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
    backgroundColor: 'rgba(255,255,255,0.15)', // overlay-color: intentional
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff', // overlay-color: intentional (white text on dark modal)
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
    color: 'rgba(255,255,255,0.85)', // overlay-color: intentional
    textAlign: 'center',
  },
  creditOverlayText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)', // overlay-color: intentional
    textAlign: 'center',
    marginTop: 4,
  },
});
