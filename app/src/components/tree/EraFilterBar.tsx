/**
 * EraFilterBar — Horizontal era filter buttons for the tree.
 */

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { eras, eraNames, base, spacing, radii, MIN_TOUCH_TARGET, fontFamily } from '../../theme';

interface Props {
  activeEra: string;
  onSelect: (era: string) => void;
}

const ERA_LIST = ['all', ...Object.keys(eras)] as const;

export function EraFilterBar({ activeEra, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingVertical: spacing.xs }}
    >
      {ERA_LIST.map((era) => {
        const isActive = activeEra === era;
        const color = era === 'all' ? base.gold : (eras[era] ?? base.gold);
        const label = era === 'all' ? 'All' : (eraNames[era] ?? era);

        return (
          <TouchableOpacity
            key={era}
            onPress={() => onSelect(era)}
            accessibilityRole="button"
            accessibilityState={{ selected: era === activeEra }}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: isActive ? color + '33' : 'transparent',
              borderWidth: 1, borderColor: isActive ? color : base.border,
              borderRadius: radii.pill,
              paddingHorizontal: 12, minHeight: MIN_TOUCH_TARGET,
            }}
          >
            {era !== 'all' && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
            )}
            <Text style={{
              color: isActive ? color : base.textMuted,
              fontFamily: fontFamily.display, fontSize: 10, letterSpacing: 0.3,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
