/**
 * EraTimeline — Horizontal era pill bar for filtering church history eras.
 *
 * Follows the same pattern as tree/EraFilterBar but uses church history eras
 * (patristic, medieval, reformation, modern).
 */
import React, { useRef, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { useTheme, spacing, radii, fontFamily, churchEras, churchEraLabels } from '../../theme';
import { lightImpact } from '../../utils/haptics';

interface Props {
  activeEra: string;
  onSelect: (era: string) => void;
}

const ERA_LIST = ['all', ...Object.keys(churchEras)] as const;

const CHIP_HEIGHT = 32;
const DOT_SIZE = 6;

export const EraTimeline = React.memo(function EraTimeline({ activeEra, onSelect }: Props) {
  const { base } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const handleChipLayout = useCallback(
    (era: string) => (e: LayoutChangeEvent) => {
      chipLayouts.current[era] = {
        x: e.nativeEvent.layout.x,
        width: e.nativeEvent.layout.width,
      };
    },
    [],
  );

  const handlePress = useCallback(
    (era: string) => {
      lightImpact();
      onSelect(era);
      requestAnimationFrame(() => {
        const layout = chipLayouts.current[era];
        if (layout && scrollRef.current) {
          scrollRef.current.scrollTo({
            x: Math.max(0, layout.x - 60),
            animated: true,
          });
        }
      });
    },
    [onSelect],
  );

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.strip}
    >
      {ERA_LIST.map((era) => {
        const isActive = activeEra === era;
        const color = era === 'all' ? base.gold : (churchEras[era] ?? base.gold);
        const label = era === 'all' ? 'All Eras' : (churchEraLabels[era] ?? era);

        return (
          <TouchableOpacity
            key={era}
            onPress={() => handlePress(era)}
            onLayout={handleChipLayout(era)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${label}`}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? color + '33' : base.bg + 'EE',
                borderColor: isActive ? color : base.gold + '55',
              },
            ]}
          >
            {era !== 'all' && (
              <View style={[styles.dot, { backgroundColor: color }]} />
            )}
            <Text
              style={[styles.label, { color: isActive ? color : base.gold }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    height: CHIP_HEIGHT,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
