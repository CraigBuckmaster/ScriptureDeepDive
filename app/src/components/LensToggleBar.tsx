/**
 * LensToggleBar — Horizontal scrollable pill bar for hermeneutic lenses.
 *
 * Shows available lenses as pills. Active lens is highlighted in gold.
 * "Default" option returns to normal view.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { HermeneuticLens } from '../types';

interface Props {
  lenses: HermeneuticLens[];
  activeLensId: string | null;
  onSelect: (lensId: string | null) => void;
}

function LensToggleBarInner({ lenses, activeLensId, onSelect }: Props) {
  const { base } = useTheme();

  if (lenses.length === 0) return null;

  return (
    <View style={[styles.container, { borderBottomColor: base.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
          style={[
            styles.pill,
            {
              backgroundColor: activeLensId === null ? base.gold : base.bgElevated,
              borderColor: activeLensId === null ? base.gold : base.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: activeLensId === null ? '#000' : base.textMuted }, // data-color: intentional (dark text on gold active pill)
            ]}
          >
            Default
          </Text>
        </TouchableOpacity>

        {lenses.map((lens) => {
          const isActive = activeLensId === lens.id;
          return (
            <TouchableOpacity
              key={lens.id}
              onPress={() => onSelect(lens.id)}
              activeOpacity={0.7}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? base.gold : base.bgElevated,
                  borderColor: isActive ? base.gold : base.border,
                },
              ]}
            >
              {lens.icon ? (
                <Text style={styles.pillIcon}>{lens.icon}</Text>
              ) : null}
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : base.textMuted }, // data-color: intentional (dark text on gold active pill)
                ]}
              >
                {lens.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export const LensToggleBar = React.memo(LensToggleBarInner);

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  pillIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  pillText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
  },
});
