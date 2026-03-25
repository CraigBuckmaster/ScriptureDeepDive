/**
 * EraFilterBar — Compact horizontal era-filter pill strip.
 *
 * Used on MapScreen, TimelineScreen, and GenealogyTreeScreen.
 * Compact 32px-tall pills with short labels; auto-scrolls to keep the
 * active pill visible.
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
import { eras, eraPillLabels, base, spacing, radii, fontFamily } from '../../theme';

interface Props {
  activeEra: string;
  onSelect: (era: string) => void;
}

const ERA_LIST = ['all', ...Object.keys(eras)] as const;

/** Height for filter chips — accessible hitSlop keeps the touch target ≥ 44. */
const CHIP_HEIGHT = 32;
const DOT_SIZE = 6;

export function EraFilterBar({ activeEra, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<Record<string, { x: number; width: number }>>({});

  /** Record each chip's position so we can scroll-to-active. */
  const handleChipLayout = useCallback(
    (era: string) => (e: LayoutChangeEvent) => {
      chipLayouts.current[era] = {
        x: e.nativeEvent.layout.x,
        width: e.nativeEvent.layout.width,
      };
    },
    [],
  );

  /** Select an era and scroll the strip to keep the pill visible. */
  const handlePress = useCallback(
    (era: string) => {
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
      contentContainerStyle={styles.strip}
    >
      {ERA_LIST.map((era) => {
        const isActive = activeEra === era;
        const color = era === 'all' ? base.gold : (eras[era] ?? base.gold);
        const label = era === 'all' ? 'All' : (eraPillLabels[era] ?? era);

        return (
          <TouchableOpacity
            key={era}
            onPress={() => handlePress(era)}
            onLayout={handleChipLayout(era)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${label} era`}
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
}

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
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
