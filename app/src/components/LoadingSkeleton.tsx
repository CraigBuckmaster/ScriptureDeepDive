/**
 * LoadingSkeleton — Animated shimmer placeholder for loading states.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { spacing, radii } from '../theme';

interface Props {
  lines?: number;
  width?: DimensionValue;
  height?: number;
}

/**
 * Gold-tinted bone color — 8% opacity gold gives a warm, branded loading feel
 * instead of the generic gray surface used in earlier iterations.
 * Card #1358 (UI polish phase 1).
 */
const BONE_COLOR = 'rgba(191, 160, 80, 0.08)';

export function LoadingSkeleton({ lines = 3, width = '100%', height = 14 }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bone,
            {
              width: i === lines - 1 ? '60%' : width,
              height,
              backgroundColor: BONE_COLOR,
            },
            animStyle,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  bone: {
    borderRadius: radii.sm,
  },
});
