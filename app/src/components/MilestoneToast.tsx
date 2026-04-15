/**
 * MilestoneToast — Subtle gold toast for reading milestones.
 * Auto-dismisses after 3 seconds. Slides up from bottom.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function MilestoneToast({ message, onDismiss }: Props) {
  const { base } = useTheme();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    // Slide in
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 3s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, translateY, opacity, onDismiss]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: base.bgElevated,
          borderColor: base.gold + '60',
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: base.gold }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    shadowColor: '#000', // overlay-color: intentional (RN shadow must be #000 on iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  text: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
    textAlign: 'center',
  },
});
