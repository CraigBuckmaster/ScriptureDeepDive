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
import { useTheme, spacing, radii } from '../theme';

interface Props {
  lines?: number;
  width?: DimensionValue;
  height?: number;
}

export function LoadingSkeleton({ lines = 3, width = '100%', height = 14 }: Props) {
  const { base } = useTheme();
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
              backgroundColor: base.bgSurface,
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
