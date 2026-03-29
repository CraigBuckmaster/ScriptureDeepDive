/**
 * ChapterSkeleton — Content-shaped loading placeholder for ChapterScreen.
 *
 * Mimics the real layout: title block, subtitle, badge row, section header,
 * verse lines of varying width, button row pills. Uses a pulsing opacity
 * animation on reanimated shared values.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { base, spacing, radii } from '../theme';

function Bone({ width, height = 14, style }: {
  width: DimensionValue;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: base.bgSurface,
          borderRadius: radii.sm,
        },
        style,
      ]}
    />
  );
}

export function ChapterSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const pulse = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, pulse]}>
      {/* Title */}
      <View style={styles.header}>
        <Bone width="70%" height={22} />
        <View style={styles.subtitleRow}>
          <Bone width="45%" height={14} />
          <Bone width={80} height={20} style={{ borderRadius: 10 }} />
          <Bone width={70} height={20} style={{ borderRadius: 10 }} />
        </View>
      </View>

      {/* Section 1 */}
      <View style={styles.section}>
        <Bone width="55%" height={13} style={{ marginBottom: 12 }} />
        <Bone width="95%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="100%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="88%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="92%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="60%" height={15} />
      </View>

      {/* Button row */}
      <View style={styles.buttonRow}>
        <Bone width={70} height={36} style={{ borderRadius: 6 }} />
        <Bone width={80} height={36} style={{ borderRadius: 6 }} />
        <Bone width={65} height={36} style={{ borderRadius: 6 }} />
        <Bone width={72} height={36} style={{ borderRadius: 6 }} />
        <Bone width={1} height={24} />
        <Bone width={80} height={36} style={{ borderRadius: 16 }} />
        <Bone width={55} height={36} style={{ borderRadius: 16 }} />
      </View>

      {/* Section 2 */}
      <View style={styles.section}>
        <Bone width="48%" height={13} style={{ marginBottom: 12 }} />
        <Bone width="97%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="100%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="85%" height={15} style={{ marginBottom: 6 }} />
        <Bone width="70%" height={15} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
    padding: spacing.md,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});
