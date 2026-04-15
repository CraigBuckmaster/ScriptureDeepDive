/**
 * DetailHeroHeader — Shared hero header for detail screens with imagery.
 *
 * Two visual variants:
 *   1. Image variant: full-width image at `height`px with dark gradient overlay
 *      at the bottom. Title + subtitle overlaid in white text.
 *   2. No-image variant: shorter (100px) tinted gradient background with title
 *      in gold.
 *
 * Back button is overlaid at top-left in a semi-transparent circle so it works
 * against both variants. Falls back gracefully when imageUrl fails to load.
 *
 * Card #1360 (UI polish phase 3). Used by Archaeology / Person / TimeTravel /
 * Topic detail screens where imagery exists on R2.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  /** R2 URL for the hero image. If omitted or load fails, falls back to the tinted variant. */
  imageUrl?: string;
  /** Override the tinted background color for the no-image variant. Defaults to base.tintParchment. */
  fallbackTint?: string;
  /** Image variant height. Defaults to 140. */
  height?: number;
  onBack: () => void;
  /** Accessibility label for the back button. */
  backLabel?: string;
}

const NO_IMAGE_HEIGHT = 100;

const OVERLAY_TITLE = '#ffffff'; // overlay-color: intentional (title over dark gradient)
const OVERLAY_SUBTITLE = 'rgba(255,255,255,0.85)'; // overlay-color: intentional
const BACK_BG = 'rgba(0,0,0,0.35)'; // overlay-color: intentional

export function DetailHeroHeader({
  title,
  subtitle,
  imageUrl,
  fallbackTint,
  height = 140,
  onBack,
  backLabel = 'Go back',
}: Props) {
  const { base } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = !!imageUrl && !imageFailed;
  const containerHeight = showImage ? height : NO_IMAGE_HEIGHT;
  const tint = fallbackTint ?? base.tintParchment;

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight,
          backgroundColor: showImage ? base.bgElevated : tint,
        },
      ]}
    >
      {showImage ? (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="disk"
            transition={400}
            onError={() => setImageFailed(true)}
            recyclingKey={imageUrl}
          />
          <View style={styles.gradient} pointerEvents="none" />
        </>
      ) : null}

      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backButton, { backgroundColor: showImage ? BACK_BG : 'transparent' }]}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <ArrowLeft size={20} color={showImage ? OVERLAY_TITLE : base.gold} />
      </TouchableOpacity>

      {/* Title / subtitle */}
      <View style={styles.textBlock} pointerEvents="none">
        <Text
          style={[
            styles.title,
            { color: showImage ? OVERLAY_TITLE : base.gold },
          ]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { color: showImage ? OVERLAY_SUBTITLE : base.textMuted },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    // Approximate a bottom-to-top dark gradient using a shadow cast over
    // a transparent view. Avoids pulling in expo-linear-gradient for this
    // single use case (same approach as GoldSeparator).
    backgroundColor: 'transparent',
    shadowColor: '#000', // overlay-color: intentional
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
  backButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
    marginTop: spacing['2xs'],
  },
});
