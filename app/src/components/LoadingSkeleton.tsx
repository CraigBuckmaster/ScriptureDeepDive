/**
 * LoadingSkeleton — Animated shimmer placeholder for loading states.
 */

import React, { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { base, spacing, radii } from '../theme';

interface Props {
  lines?: number;
  width?: DimensionValue;
  height?: number;
}

export function LoadingSkeleton({ lines = 3, width = '100%', height = 14 }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            {
              width: i === lines - 1 ? '60%' : width,
              height,
              backgroundColor: base.bgSurface,
              borderRadius: radii.sm,
            },
            animStyle,
          ]}
        />
      ))}
    </View>
  );
}
