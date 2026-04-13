/**
 * SpousePill — Small pill under a person's tree node showing a spouse name.
 *
 * Tap navigates the caller to the spouse's node (by re-centring the viewport).
 * Uses the infinity symbol as the connector — no icon fonts.
 *
 * Part of Card #1265 (Genealogy redesign Phase 1).
 */

import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, fontFamily, radii } from '../../theme';

export interface SpousePillProps {
  spouseId: string;
  spouseName: string;
  onPress: (spouseId: string) => void;
}

export function SpousePill({ spouseId, spouseName, onPress }: SpousePillProps) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(spouseId)}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityLabel={`Spouse: ${spouseName}`}
      style={[
        styles.pill,
        {
          backgroundColor: base.bgSurface,
          borderColor: base.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: base.textMuted }]} numberOfLines={1}>
        ∞ {spouseName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.ui,
    fontSize: 8,
  },
});
