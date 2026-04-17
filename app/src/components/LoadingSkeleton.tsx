/**
 * LoadingSkeleton — Animated shimmer placeholder for loading states.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type DimensionValue } from 'react-native';
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
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

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
              opacity,
            },
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
